import runRequest from '@eeacms/search/lib/runRequest';
import buildRequest from './';

function combineAggregationsFromResponses(responses) {
  return responses.reduce((acc, response) => {
    return {
      ...acc,
      ...response.body.aggregations,
    };
  }, {});
}

// To calculate a disjunctive facet correctly, you need to calculate the facet
// counts as if the filter was not applied. If you did not do this, list of
// facet values would collapse to just one value, which is whatever you have
// filtered on in that facet.
function removeFilterByName(state, facetName) {
  return {
    ...state,
    filters: state.filters.filter((f) => f.field !== facetName),
  };
}

function removeAllFacetsExcept(body, facetName) {
  return {
    ...body,
    aggs: {
      [facetName]: body.aggs[facetName],
    },
  };
}

function changeSizeToZero(body) {
  return {
    ...body,
    size: 0,
  };
}

export async function getDisjunctiveFacetCounts(
  state,
  config,
  disjunctiveFacets,
) {
  const responses = await Promise.all(
    // Note that this could be optimized by *not* executing a request if not
    // filter is currently applied for that field. Kept simple here for
    // clarity.
    (disjunctiveFacets || config.disjunctiveFacets).map((facetName) => {
      const newState = removeFilterByName(state, facetName);
      newState.resultsPerPage = 0;
      let body = buildRequest(newState, config, true);
      body = changeSizeToZero(body);
      body = removeAllFacetsExcept(body, facetName);
      // console.log('req', facetName, { newState, body });
      return runRequest(body, config);
    }),
  );
  return combineAggregationsFromResponses(responses);
}

/**
 * This function will re-calculate facets that need to be considered
 * "disjunctive" (also known as "sticky"). Calculating sticky facets correctly
 * requires a second query for each sticky facet.
 *
 * @param {*} json
 * @param {*} state
 * @param {string[]} disjunctiveFacetNames
 *
 * @return {Promise<Object>} A map of updated aggregation counts for the specified facet names
 */
export default async function applyDisjunctiveFaceting(body, state, config) {
  const disjunctiveFacetCounts = await getDisjunctiveFacetCounts(state, config);

  return {
    ...body,
    aggregations: {
      ...body.aggregations,
      ...disjunctiveFacetCounts,
    },
  };
}
