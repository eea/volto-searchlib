import { EventEmitter } from 'events';

import download from './download';

const { mockBuildRequest, mockSearch, mockScroll, mockClient } = vi.hoisted(
  () => {
    const mockSearch = vi.fn();
    const mockScroll = vi.fn();
    return {
      mockBuildRequest: vi.fn(),
      mockSearch,
      mockScroll,
      mockClient: vi.fn(() => ({ search: mockSearch, scroll: mockScroll })),
    };
  },
);

vi.mock('@eeacms/search', () => ({ buildRequest: mockBuildRequest }));
vi.mock('elasticsearch', () => ({ default: { Client: mockClient } }));

const ES_CONFIG = 'http://elastic:9200/data_searchui';

const appConfig = {
  download_fields: [
    { name: 'Title', field: 'title' },
    { name: 'Topics', field: 'topic', values_whitelist: ['Air', 'Water'] },
    { name: 'Types', field: 'objectProvides', values_blacklist: ['Internal'] },
    { name: 'Missing', field: 'not_in_source' },
  ],
};

const makeReq = (
  query = { filters: [{ field: 'topic' }], searchTerm: 'air' },
) => ({
  body: { query: JSON.stringify(query) },
});

// A response that records what the middleware writes. `write` returns true
// (the buffer is not full) unless a test says otherwise.
const makeRes = () => {
  const res = new EventEmitter();
  res.finished = false;
  res.setHeader = vi.fn();
  res.write = vi.fn(() => true);
  res.end = vi.fn();
  res.destroy = vi.fn();
  return res;
};

const hit = (source) => ({ _source: source });

const page = (hits, total = hits.length) => ({
  _scroll_id: 'scroll-1',
  hits: { total: { value: total }, hits },
});

const written = (res) => res.write.mock.calls.map(([chunk]) => chunk).join('');

// Calls the callback that download() passed to client.search().
const answerSearch = (...args) => mockSearch.mock.calls[0][1](...args);

describe('download middleware', () => {
  let consoleLog;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildRequest.mockImplementation(() => ({
      query: { match: { title: 'air' } },
      highlight: {},
      aggs: {},
      params: {},
      index: 'data_searchui',
      source: { exclude: ['embedding'] },
    }));
    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLog.mockRestore();
  });

  it('sends a CSV attachment that starts with a BOM and the column names', () => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Encoding', 'UTF-8');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv;charset=UTF-8',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-disposition',
      'attachment; filename=data.csv',
    );
    expect(res.write.mock.calls[0][0]).toBe('﻿');
    expect(written(res)).toBe('﻿Title,Topics,Types,Missing\n');
  });

  it('queries the index from the configured URL with a scrollable search', () => {
    download(ES_CONFIG, appConfig, makeReq(), makeRes());

    expect(mockBuildRequest).toHaveBeenCalledWith(
      {
        current: 1,
        filters: [{ field: 'topic' }],
        resultsPerPage: 2000,
        searchTerm: 'air',
        sortDirection: '',
        sortField: '',
      },
      appConfig,
    );
    expect(mockClient).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'http://elastic:9200/' }),
    );

    const { index, scroll, body } = mockSearch.mock.calls[0][0];
    expect(index).toBe('data_searchui');
    expect(scroll).toBe('5m');
    expect(body).toEqual({
      query: { match: { title: 'air' } },
      size: 2000,
      _source: { exclude: ['embedding', 'nlp_250'] },
    });
  });

  it('writes one CSV row per hit, filtering values and filling missing fields', () => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);
    res.write.mockClear();

    answerSearch(
      null,
      page([
        hit({
          title: 'Air quality',
          topic: ['Air', 'Noise', 'Water'],
          objectProvides: ['Report', 'Internal'],
        }),
        hit({ title: 'Single', topic: 'Air', objectProvides: 'Internal' }),
      ]),
    );

    // Whitelisted topics only, blacklisted types dropped, missing fields empty.
    expect(written(res)).toBe(
      'Air quality,"Air,Water",Report,\nSingle,Air,,\n',
    );
    expect(mockScroll).toHaveBeenCalledWith(
      { scroll: '5m', scrollId: 'scroll-1' },
      expect.any(Function),
    );
  });

  it('ends the response once every hit has been written', () => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);

    answerSearch(null, page([hit({ title: 'Only' })], 1));
    expect(res.end).not.toHaveBeenCalled();

    // The next page: the offset (one full scroll) is past the total.
    const nextPage = mockScroll.mock.calls[0][1];
    nextPage(null, page([], 1));

    expect(res.end).toHaveBeenCalled();
    expect(mockScroll).toHaveBeenCalledTimes(1);
  });

  it('waits for the response to drain before asking for the next page', () => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);
    res.write.mockReturnValue(false);

    answerSearch(null, page([hit({ title: 'Big' })]));
    expect(mockScroll).not.toHaveBeenCalled();

    res.emit('drain');
    expect(mockScroll).toHaveBeenCalledWith(
      { scroll: '5m', scrollId: 'scroll-1' },
      expect.any(Function),
    );
  });

  it('stops writing when the response is already finished', () => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);
    res.write.mockClear();
    res.finished = true;

    answerSearch(null, page([hit({ title: 'Late' })]));

    expect(res.write).not.toHaveBeenCalled();
    expect(mockScroll).not.toHaveBeenCalled();
  });

  it('ends the response when the client closes the connection', () => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);

    res.emit('close');

    expect(res.end).toHaveBeenCalled();
  });

  it.each([
    ['an Elasticsearch error', [new Error('boom'), undefined]],
    ['no data', [null, undefined]],
    ['data without hits', [null, { _scroll_id: 'scroll-1' }]],
  ])('destroys the response on %s', (_, args) => {
    const res = makeRes();
    download(ES_CONFIG, appConfig, makeReq(), res);
    res.write.mockClear();

    answerSearch(...args);

    expect(res.destroy).toHaveBeenCalled();
    expect(res.write).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalled();
  });
});
