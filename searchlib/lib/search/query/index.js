/*

  Converts current application state to an Elasticsearch request.

  When implementing an onSearch Handler in Search UI, the handler needs to take
  the current state of the application and convert it to an API request.

  For instance, there is a "current" property in the application state that you
  receive in this handler. The "current" property represents the current page
  in pagination. This method converts our "current" property to Elasticsearch's
  "from" parameter.

  This "current" property is a "page" offset, while Elasticsearch's "from"
  parameter is a "item" offset. In other words, for a set of 100 results and
  a page size of 10, if our "current" value is "4", then the equivalent
  Elasticsearch "from" value would be "40". This method does that conversion.

  We then do similar things for searchTerm, filters, sort, etc.
*/

import { buildFullTextMatch } from './fullText';
import { buildRequestFilter } from './filters';
import { buildAggregationsQuery } from './aggregations';
import { buildHighlight } from './highlight';

function buildFrom(current, resultsPerPage) {
  if (!current || !resultsPerPage) return;
  return (current - 1) * resultsPerPage;
}

function buildSort(sortDirection, sortField) {
  if (sortDirection && sortField) {
    return [{ [`${sortField}`]: sortDirection }];
  }
}

// TODO: implement boostFacets
function boostFacets(filters, config) {
  return [];
}

/**
 * Create a DSL query for ES. See the following pages for more info:
 *
 *  https://www.elastic.co/guide/en/elasticsearch/reference/7.x/full-text-queries.html
 *  https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-sort.html
 *  https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-request-from-size.html
 *
 */
export default function buildRequest(state, config, includeAggs = null) {
  const {
    current,
    filters,
    resultsPerPage,
    searchTerm,
    sortDirection,
    sortField,
  } = state;

  const sort = buildSort(sortDirection, sortField, config);
  const match = buildFullTextMatch(searchTerm, filters, config);
  const size = resultsPerPage;
  const from = buildFrom(current, resultsPerPage, config);
  const filter = buildRequestFilter(filters, config);
  const aggs = includeAggs ? buildAggregationsQuery(config, includeAggs) : {};
  const highlight = buildHighlight(searchTerm, config);

  // console.log({ sort, match, size, from, filter, filters });

  const body = (config.requestBodyModifiers || []).reduce(
    (acc, modifier) => modifier(acc, config),
    {
      query: {
        // Dynamic values based on current Search UI state
        function_score: {
          query: {
            bool: {
              ...(config?.extraRAWQueryFilters || {}),
              must: match,
              ...(filter && { filter }),
            },
          },
          functions: [
            ...(config.extraQueryParams?.functions || []),
            ...boostFacets(filters, config),
          ],
          score_mode: config.extraQueryParams?.score_mode || 'sum',
        },
      },
      aggs,
      ...highlight,
      ...(sort && { sort }),
      ...(size && { size }),
      ...(from && { from }),
      ...(config.runtime_mappings && {
        runtime_mappings: config.runtime_mappings,
      }),

      ...config.requestParams,
      ...(config.index_name ? { index: config.index_name } : {}),
      ...(config.sourceExcludedFields?.length
        ? {
            [config.enableNLP ? 'source' : '_source']: {
              exclude: [...(config.sourceExcludedFields || [])],
            },
          }
        : {}),

      track_total_hits: true,
      ...(config.debugQuery ? { explain: true } : {}),
    },
  );

  // body.params.query = searchTerm;
  // body.params.custom_query = body.query;

  return body;
}
