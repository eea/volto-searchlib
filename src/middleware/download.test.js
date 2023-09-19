import download from './download';
import es from 'elasticsearch';
import { buildRequest } from '@eeacms/search';
import '@testing-library/jest-dom/extend-expect';

jest.mock('elasticsearch');
jest.mock('elasticsearch', () => {
  const mClient = {
    search: jest.fn(),
    scroll: jest.fn(),
  };
  return {
    Client: jest.fn(() => mClient),
  };
});

describe('download function', () => {
  let mockReq, mockRes, mockClient;

  beforeEach(() => {
    mockReq = {
      body: {
        query: JSON.stringify({ filters: [], searchTerm: '' }),
      },
    };
    mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      once: jest.fn(),
      end: jest.fn(),
      destroy: jest.fn(),
      finished: false,
    };
    mockClient = {
      search: jest.fn(),
      scroll: jest.fn(),
    };
    es.Client.mockImplementation(() => mockClient);
    buildRequest.mockReturnValue({});
  });

  it('should handle Elasticsearch search and scroll', async () => {
    mockClient.search.mockImplementation((_, cb) => {
      cb(null, {
        hits: {
          total: { value: 1 },
          hits: [{ _source: { field1: 'value1' } }],
        },
      });
    });

    mockClient.scroll.mockImplementation((_, cb) => {
      cb(null, {
        hits: {
          total: { value: 0 },
          hits: [],
        },
      });
    });

    await download(
      'http://localhost:3000/index_name',
      { download_fields: [{ name: 'Field1', field: 'field1' }] },
      mockReq,
      mockRes,
    );

    expect(mockRes.write).toHaveBeenCalled();
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('should handle Elasticsearch errors', async () => {
    mockClient.search.mockImplementation((_, cb) => {
      cb(new Error('Elasticsearch error'), null);
    });

    await download(
      'http://localhost:3000/index_name',
      { download_fields: [{ name: 'Field1', field: 'field1' }] },
      mockReq,
      mockRes,
    );

    expect(mockRes.destroy).toHaveBeenCalled();
  });
});
