import registry from '@eeacms/search/registry';

const isFunction = (value) =>
  value &&
  (Object.prototype.toString.call(value) === '[object Function]' ||
    'function' === typeof value ||
    value instanceof Function);

/**
 * Construct the ES DSL filter query
 *
 * This will participate in the query part, filtering the result set.
 *
 */
export function buildRequestFilter(filters, config, options = {}) {
  if (!(filters.length || config.permanentFilters?.length)) return;
  const { includeDefaultValues = false } = options;

  // a field:value map
  const _fieldToFilterValueMap = Object.assign(
    {},
    ...filters.map((filter) => ({ [filter.field]: filter })),
  );

  const _configuredFacets = Object.assign(
    {},
    ...config.facets?.map((facetConfig) => {
      return {
        [facetConfig.id || facetConfig.field]: {
          ...registry.resolve[facetConfig.factory],
          ...facetConfig,
        },
      };
    }),
  );

  const configuredFilters = [
    ...Object.entries(_configuredFacets).map(([fieldName, facetConfig]) =>
      facetConfig.buildFilter(
        _fieldToFilterValueMap[facetConfig.field] ??
          (facetConfig.default && includeDefaultValues
            ? {
                field: facetConfig.field,
                ...facetConfig.default,
              }
            : null),
        facetConfig,
      ),
    ),
    ...config.permanentFilters?.map((f) => (isFunction(f) ? f() : f)),
  ].filter((f) => !!f);

  const requestFilters = Object.keys(_fieldToFilterValueMap)
    .filter(
      (fname) =>
        [
          ...Object.keys(_configuredFacets),
          ...Object.values(_configuredFacets).map((f) => f.field),
        ].indexOf(fname) === -1,
    )
    .map((fname) => getTermFilter(_fieldToFilterValueMap[fname]));

  const res = [...configuredFilters, ...requestFilters];
  // console.log('res', { requestFilters, _configuredFacets });

  return res;
}

export function getTermFilterValue(field, fieldValue) {
  // We do this because if the value is a boolean value, we need to apply
  // our filter differently. We're also only storing the string representation
  // of the boolean value, so we need to convert it to a Boolean.

  // TODO We need better approach for boolean values
  if (fieldValue === 'false' || fieldValue === 'true') {
    return { [field]: fieldValue === 'true' };
  }

  return { [`${field}`]: fieldValue };
}

export function getTermFilter(filter) {
  // Construct ES DSL query for term facets
  if (!filter) return;
  let [filter_type, exact] = (filter.type || '').split(':');

  const op = filter_type === 'any' ? 'should' : 'must';
  let query = {
    bool: {
      [op]: filter.values.map((filterValue) => ({
        term: getTermFilterValue(filter.field, filterValue),
      })),
      ...(filter.values?.length && op === 'should'
        ? { minimum_should_match: 1 }
        : {}),
      ...(exact
        ? {
            must: {
              term: {
                ['items_count_' + filter.field]: 1,
              },
            },
          }
        : {}),
    },
  };
  return query;
}

export function getRangeFilter(filter) {
  // Construct ES DSL query for range facets
  if (!filter) return;

  const op = filter.type === 'any' ? 'should' : 'filter';
  return {
    bool: {
      [op]: filter.values.map((filterValue) => ({
        range: {
          [filter.field]: {
            ...(filterValue.to && { to: filterValue.to }),
            ...(filterValue.to && { from: filterValue.from }),
          },
        },
      })),
      ...(op === 'should' ? { minimum_should_match: 1 } : {}),
    },
  };
}

const splitter_re = /(?<now>now)\s?(?<op>[\+|\-])\s?(?<count>\d+)(?<quantifier>\w)/;

const DAY = 86400000; // 1000 * 60 * 60 * 24

export function getDateRangeFilter(filter, filterConfig) {
  // Construct ES DSL query for range facets
  if (!filter) return;

  // should = "or", filter = "and"
  const minus = (x, y) => x - y;
  const plus = (x, y) => x + y;

  const toDays = (quantifier) =>
    quantifier === 'd'
      ? (x) => x * 1
      : quantifier === 'w'
      ? (x) => x * 7
      : quantifier === 'm'
      ? (x) => x * 30
      : quantifier === 'y'
      ? (x) => x * 365
      : (x) => x * 1;

  const toDate = (name) => {
    if (!name) return {};
    const now = new Date().getTime();
    if (name === 'now') return now;
    const match = name.match(splitter_re);
    let { op, count, quantifier } = match.groups;
    op = op === '-' ? minus : plus;
    const other = op(now, toDays(quantifier)(parseInt(count)) * DAY);
    return other;
  };

  const toRangeFilter = (filterValue) => {
    const found = filterConfig.ranges.find((f) => f.key === filterValue);
    return found.to && found.from
      ? { to: toDate(found.to), from: toDate(found.from) }
      : {};
  };

  const op = filter.type === 'any' ? 'should' : 'filter';
  const res = {
    bool: {
      [op]: filter.values.map((filterValue) => ({
        range: {
          [filter.field]: toRangeFilter(filterValue),
        },
      })),
      minimum_should_match: 1,
    },
  };

  return res;
}

export const getHistogramFilter = getRangeFilter;

export function getBooleanFilter(filter, facetConfig) {
  const value = filter ? filter.values[0] : false;

  const res = value ? facetConfig.on : facetConfig.off;
  return res;
}
