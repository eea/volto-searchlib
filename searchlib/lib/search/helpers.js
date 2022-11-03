/**
 * a copy of https://github.com/elastic/search-ui/blob/d8c8333ab0713394aad1edec093a873017276054/packages/search-ui/src/helpers.js
 * to facilitate debugging
 */

import deepEqual from 'deep-equal';
import { getDefaultFilters } from '@eeacms/search/lib/utils';

/**
 * Given a list of applied Filters, find FilterValues based on
 * "fieldName" and "filterType".
 *
 * @param {*} filters
 * @param {*} name
 * @param {*} filterType
 */
export function findFilterValues(filters, name, filterType) {
  const filter = filters.find((f) => f.field === name && f.type === filterType);
  if (!filter) return [];
  return filter.values;
}

/**
 * Given a list of applied Filters, remove a single FilterValue based on
 * "fieldName" and "filterType".
 *
 * @param {Filter[]} filters
 * @param {String} fieldName
 * @param {FilterValue} value
 * @param {FilterType} filterType
 */
export function removeSingleFilterValue(filters, fieldName, value, filterType) {
  return filters.reduce((acc, filter) => {
    const { field, values, type, ...rest } = filter;
    if (field === fieldName && (!filterType || type === filterType)) {
      const updatedFilterValues = values.filter(
        (filterValue) => !doFilterValuesMatch(filterValue, value),
      );
      if (updatedFilterValues.length > 0) {
        return acc.concat({
          field,
          values: updatedFilterValues,
          type,
          ...rest,
        });
      } else {
        return acc;
      }
    }
    return acc.concat(filter);
  }, []);
}

/**
 * Given a Facet and a list of applied Filters, mark the Facet Values
 * for that Facet as "selected" based on "fieldName" and "filterType".
 *
 * @param {Facet} facet
 * @param {String} fieldName
 * @param {Filter[]} filters
 * @param {FilterType} filterType
 */
export function markSelectedFacetValuesFromFilters(
  facet,
  filters,
  fieldName,
  filterType,
) {
  // debugger;
  const facetValues = facet.data;
  const filterValuesForField =
    findFilterValues(filters, fieldName, filterType) || [];
  return {
    ...facet,
    data: facetValues.map((facetValue) => {
      return {
        ...facetValue,
        selected: filterValuesForField.some((filterValue) => {
          return doFilterValuesMatch(filterValue, facetValue.value);
        }),
      };
    }),
  };
}

function getFilterValueDisplay(filterValue) {
  if (filterValue === undefined || filterValue === null) return '';
  if (filterValue.hasOwnProperty('name')) return filterValue.name;
  return String(filterValue);
}

/**
 * Useful for determining when filter values match. This could be used
 * when matching applied filters back to facet options, or for determining
 * whether or not a filter already exists in a list of applied filters.
 *
 * @param {FilterValue} filterValue1
 * @param {FilterValue} filterValue2
 */
export function doFilterValuesMatch(filterValue1, filterValue2) {
  if (filterValue1?.name || filterValue2?.name)
    // If two filters have matching names, then they are the same filter, there
    // is no need to do a more expensive deep equal comparison.
    //
    // This is also important because certain filters and facets will have
    // differing values than their corresponding facet options. For instance,
    // consider a time-based facet like "Last 10 Minutes". The value of the
    // filter will be different depending on when it was selected, but the name
    // will always match.
    return (
      getFilterValueDisplay(filterValue1) ===
      getFilterValueDisplay(filterValue2)
    );
  // We use 'strict = true' to do a '===' of leaves, rather than '=='
  return deepEqual(filterValue1, filterValue2, { strict: true });
}

// Mix unique filter type from one array into the other
export function mergeFilters(filters1, filters2) {
  if (!filters2) return filters1;

  return filters2.reduce((acc, next) => {
    if (acc.find((f) => f.type === next.type && f.field === next.field)) {
      return acc;
    }
    return [...acc, next];
  }, filters1);
}

export function resetFiltersToDefault(searchContext, appConfig) {
  const { setFilter, clearFilters } = searchContext;

  clearFilters();

  appConfig.facets
    .filter((f) => !!f.default)
    .forEach((facet) => {
      facet.default.values.forEach((value) =>
        setFilter(facet.field, value, facet.default.type || 'any'),
      );
    });
}

/**
 * Returns true/false depending of if current filters are exactly the value of
 * the default filters
 */
export function hasNonDefaultFilters(filters, appConfig) {
  if (!filters?.length) return false;

  const defaultFiltersList = getDefaultFilters(appConfig);
  const defaultFilterFields = defaultFiltersList.map((f) => f.field);
  const activeFilterFields = filters.map((f) => f.field);

  const nonDefaultFilterFields = activeFilterFields.filter(
    (name) => defaultFilterFields.indexOf(name) === -1,
  );

  if (nonDefaultFilterFields.length) return true;

  const defaultFilterFieldsNotApplied = defaultFilterFields.filter(
    (name) => activeFilterFields.indexOf(name) === -1,
  );

  if (defaultFilterFieldsNotApplied.length) return true;

  const activeFilters = Object.assign(
    {},
    ...filters.map((f) => ({ [f.field]: { ...f, values: f.values.sort() } })),
  );
  const defaultFilters = Object.assign(
    {},
    ...defaultFiltersList.map((f) => ({ [f.field]: f })),
  );

  return !deepEqual(activeFilters, defaultFilters);
}

/**
 * Returns true if the filter value object (like {field, type, value}) is default
 */
export function isFilterValueDefaultValue(filter, appConfig) {
  const field = filter.field;

  const defaultFiltersList = appConfig.facets
    .filter((f) => f.field === field && !!(f.default ?? false))
    .map((facet) => ({
      field: facet.field,
      values: facet.default.values.sort(),
      type: facet.default.type || 'any',
    }));
  const defaultFilterValue = defaultFiltersList[0];

  return deepEqual(filter, defaultFilterValue);
}

/**
 * Determine if the user has "interacted" with the search engine.
 *
 * The "interaction" state is used to determine if the user sees the default
 * landing page, or the results page.
 *
 * The landing page is shown:
 *
 * - if there are no filters
 *   - or the filters are default
 * - if there is no search term
 */
export const checkInteracted = ({ searchContext, appConfig }) => {
  const { wasSearched, resultSearchTerm, filters } = searchContext;

  const filtersAreNotDefault = hasNonDefaultFilters(filters, appConfig);
  const hasFilters = filters.length === 0;

  const wasInteracted = wasSearched
    ? resultSearchTerm || filtersAreNotDefault
    : resultSearchTerm || !(hasFilters || !filtersAreNotDefault);

  return wasInteracted;
};
