// import { indexOf } from 'lodash';

export function getValueFacet({
  aggregations,
  fieldName,
  whitelist = [],
  blacklist = [],
}) {
  if (aggregations?.[fieldName]?.buckets?.length > 0) {
    const unfiltered_data = aggregations[fieldName].buckets.map((bucket) => ({
      // Boolean values and date values require using `key_as_string`
      value: bucket.key_as_string || bucket.key,
      count: bucket.doc_count,
    }));
    let filtered_data = unfiltered_data.filter(
      (bucket) => blacklist.indexOf(bucket.value) === -1,
    );
    if (whitelist.length) {
      filtered_data = filtered_data.filter(
        (bucket) => whitelist.indexOf(bucket.value) !== -1,
      );
    }
    return [
      {
        field: fieldName,
        type: 'value',
        data: filtered_data,
      },
    ];
  }
}

export function getRangeFacet(options) {
  const { aggregations, fieldName, config } = options;
  // TODO: do normalization here;
  const facetConfig = config.facets.find(({ field }) => field === fieldName);

  let aggs_data = (aggregations[fieldName]?.buckets || []).map(
    ({ to, from, key, doc_count }) => ({
      // Boolean values and date values require using `key_as_string`
      value: {
        to,
        from,
        name: key,
      },
      count: doc_count,
    }),
  );
  if (facetConfig !== undefined) {
    let sorted_aggs_data = [];
    facetConfig.ranges.forEach(function (fixed_range) {
      let agg = aggs_data.filter(
        (agg) =>
          agg.value.from === fixed_range.from &&
          agg.value.to === fixed_range.to,
      );
      if (!agg.length) return;
      agg[0].config = fixed_range;
      agg[0].value.rangeType = facetConfig.rangeType;
      sorted_aggs_data.push(agg[0]);
    });
    aggs_data = sorted_aggs_data;
  }
  if (aggregations?.[fieldName]?.buckets?.length > 0) {
    return [
      {
        field: fieldName,
        type: 'range',
        data: aggs_data,
      },
    ];
  }
}

export function getHistogramFacet(aggregations, fieldName) {}

export function getBooleanFacet(options) {}

// export function getDateRangeFacet(options, fieldName) {
//   console.log('getDateRangeFacet', options, fieldName);
// }
