import { getSummarySources } from './summarySources';

describe('getSummarySources', () => {
  const documents = [
    {
      document_id: 'doc-1',
      semantic_identifier: 'Which pollutants cause air pollution?',
      link: 'https://www.eea.europa.eu/en/topics/air-pollution',
      blurb: 'Air pollution topic page',
      source_type: 'web',
    },
    {
      document_id: 'doc-2',
      semantic_identifier: 'Air quality in Europe',
      link: 'https://www.eea.europa.eu/en/analysis/air-quality',
      blurb: 'Analysis',
      source_type: 'web',
    },
    {
      document_id: 'doc-3',
      semantic_identifier: 'Retrieved but never cited',
      link: 'https://www.eea.europa.eu/en/uncited',
      blurb: 'Not in the answer',
      source_type: 'web',
    },
  ];

  it('returns only cited documents, deduplicated by document_id', () => {
    const sources = getSummarySources({
      citations: { 1: 'doc-1', 2: 'doc-2', 3: 'doc-2' },
      documents,
    });

    expect(sources.map((source) => source.document_id)).toEqual([
      'doc-1',
      'doc-2',
    ]);
  });

  it('orders sources by their first citation number and keeps it', () => {
    const sources = getSummarySources({
      // The stream may deliver citations out of order.
      citations: { 2: 'doc-2', 1: 'doc-1' },
      documents,
    });

    expect(sources.map((source) => [source.document_id, source.index])).toEqual(
      [
        ['doc-1', 1],
        ['doc-2', 2],
      ],
    );
  });

  it('keeps a cited document that has no link', () => {
    const sources = getSummarySources({
      citations: { 1: 'doc-1' },
      documents: [
        {
          document_id: 'doc-1',
          semantic_identifier: 'A document without a link',
          link: null,
        },
      ],
    });

    expect(sources).toHaveLength(1);
    expect(sources[0].link).toBeNull();
  });

  it('skips cited ids that do not resolve to a retrieved document', () => {
    const sources = getSummarySources({
      citations: { 1: 'missing-doc', 2: 'doc-1' },
      documents,
    });

    expect(sources.map((source) => source.document_id)).toEqual(['doc-1']);
  });

  it('returns an empty list when the message has no citations', () => {
    expect(getSummarySources({ citations: undefined, documents })).toEqual([]);
    expect(getSummarySources({ documents })).toEqual([]);
    expect(getSummarySources(null)).toEqual([]);
  });
});
