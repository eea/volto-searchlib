import buildStateFacets from './facets';
import buildResults from './results';

export buildStateFacets from './facets';
export buildResults from './results';

/*
  Converts an Elasticsearch response to new application state

  When implementing an onSearch Handler in Search UI, the handler needs to
  convert search results into a new application state that Search UI
  understands.

  For instance, Elasticsearch returns "hits" for search results. This maps to
  the "results" property in application state, which requires a specific
  format. So this file iterates through "hits" and reformats them to "results"
  that Search UI understands.

  We do similar things for facets and totals.
*/
export default function buildState(response, resultsPerPage, config) {
  const results = buildResults(response.hits.hits, config);
  const totalResults = buildTotalResults(response.hits);
  const totalPages = buildTotalPages(resultsPerPage, totalResults);

  const facets = buildStateFacets(response.aggregations, config);

  return (config.stateModifiers || []).reduce(
    (acc, modifier) => modifier(acc, response, config),
    {
      results,
      totalPages,
      totalResults,
      ...(facets && { facets }),
      query_type: response.query_type,
    },
  );
}

function buildTotalPages(resultsPerPage, totalResults) {
  if (!resultsPerPage) return 0;
  if (totalResults === 0) return 1;
  return Math.ceil(totalResults / resultsPerPage);
}

function buildTotalResults(hits) {
  return hits.total.value;
}
