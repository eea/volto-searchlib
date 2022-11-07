import buildRequest from '@eeacms/search/lib/search/query';
import runRequest from '@eeacms/search/lib/runRequest';

function combineAggregationsFromResponses(responses) {
  return responses.reduce((acc, response) => {
    return {
      ...acc,
      ...response.body.aggregations,
    };
  }, {});
}

function removeFilterByNames(state, facetNames) {
  // items_count_ is to support exact facets
  const validNames = facetNames.reduce(
    (acc, name) => [...acc, name, `items_count_${name}`],
    [],
  );
  return {
    ...state,
    filters: state.filters.filter((f) => validNames.indexOf(f.field) > -1),
  };
}

function removeAllFacetsExcept(body, facetNames) {
  return {
    ...body,
    aggs: Object.assign(
      {},
      ...facetNames.map((name) => ({ [name]: body.aggs[name] })),
    ),
  };
}

function changeSizeToZero(body) {
  return {
    ...body,
    size: 0,
  };
}

export async function getFacetCounts(state, config, facetNames) {
  const disjunctiveFacetNames = facetNames.filter((name) =>
    state.filters.find((f) => f.field === name),
  );
  const normalFacetNames = facetNames.filter(
    (name) => disjunctiveFacetNames.indexOf(name) === -1,
  );

  // batch non-exact aggregations together
  let body = buildRequest({ filters: [] }, config, true); // for normal we don't want filters
  body = changeSizeToZero(body);
  body = removeAllFacetsExcept(body, normalFacetNames);
  const normalRequest = runRequest(body, config);
  // console.log('normal-req', { normalFacetNames, body });

  const responses = await Promise.all(
    // Note that this could be optimized by *not* executing a request if not
    // filter is currently applied for that field. Kept simple here for
    // clarity.
    [
      normalRequest,
      ...disjunctiveFacetNames.map((facetName) => {
        const newState = removeFilterByNames(state, [facetName]);
        let body = buildRequest(newState, config, true);
        body = changeSizeToZero(body);
        body = removeAllFacetsExcept(body, [facetName]);
        // console.log('exact-req', facetName, { newState, body });
        return runRequest(body, config);
      }),
    ],
  );
  return combineAggregationsFromResponses(responses);
}
