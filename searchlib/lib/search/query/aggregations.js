import registry from '@eeacms/search/registry';

/**
 * Build a suitable object for the aggregations part of the query.
 *
 * Pass a suitable list as facetFieldNames if you want to limit the facets
 * retrieved.
 */
export const buildAggregationsQuery = (config, includeAggs) => {
  const facets = config.facets;

  const aggregations = Object.assign(
    {},
    ...facets
      .filter((facet) =>
        includeAggs && Array.isArray(includeAggs)
          ? includeAggs.includes(facet.field)
          : !!includeAggs,
      )
      .map((facet) => {
        const { buildRequest: buildFacetRequest } = registry.resolve[
          facet.factory
        ];
        return buildFacetRequest ? buildFacetRequest(facet, config) : {}; // include the aggregations
      }),
  );

  return aggregations;
};

// TODO: exclude current aggregation field from request
export const buildTermFacetAggregationRequest = (facet, config) => {
  return {
    [facet.field]: {
      terms: {
        field: facet.field,
        size: 1000000,
        // order: { _key: 'asc' },
      },
    },
  };
};

export const buildHistogramFacetAggregationRequest = (facet) => {
  const qs = {
    range: { field: facet.field },
  };

  if (facet.aggs_script) {
    delete qs.range.field;
    qs.range.script = facet.aggs_script; // allow facet.aggs_script
  }

  if (facet.ranges) {
    qs.range.ranges = facet.ranges;
  }

  return {
    [facet.field]: qs,
  };

  // See
  // https://github.com/eea/eea.searchserver.js/blob/e3ba7c61cb8d23125b9d9ef240f0b9def790fae6/lib/framework/public/facetview/jquery.facetview.js#L7678-L7691
};

export const buildRangeFacetAggregationRequest = (facet) => {
  let qs = {};
  qs[facet.field] = {
    range: {
      field: facet.field,
      ranges: facet.ranges,
    },
  };
  return qs;
};

export const buildBooleanFacetRequest = (facet) => {};
export const buildDateRangeFacetAggregationRequest = (facet) => {};
