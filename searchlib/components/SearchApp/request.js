import {
  resetFiltersToDefault,
  doFilterValuesMatch,
} from '@eeacms/search/lib/search/helpers';
import { getDefaultFilters } from '@eeacms/search/lib/utils';
import { removeSingleFilterValue } from '@elastic/search-ui/lib/cjs/helpers';

export function resetFilters() {
  const { appConfig, searchContext } = this;

  return resetFiltersToDefault(searchContext, appConfig);
}

export function resetSearch(resetState) {
  const { appConfig, driver } = this; // searchContext,

  const state = resetState || driver.URLManager.getStateFromURL();
  const { defaultSearchText = '' } = appConfig;
  const text = state.searchTerm || defaultSearchText;
  state.searchTerm = text;

  if (!state.filters) state.filters = getDefaultFilters(appConfig);

  // console.log('reset state', state);
  driver._updateSearchResults(state);
}

export function clearFilters(except = []) {
  const { setFilter } = this.driver;

  this.driver.clearFilters(except);
  this.appConfig.facets
    .filter((f) => !!f.default)
    .forEach((facet) => {
      facet.default.values.forEach((value) =>
        setFilter(facet.field, value, facet.default.type || 'any'),
      );
    });
}

export function addFilter() {
  const [field, value, type] = arguments;
  const name = field;

  // a customized version of addFilter that converts existing filters to the
  // new type, starting from the idea that each field name is unique

  if (this.driver.debug)
    // eslint-disable-next-line no-console
    console.log('Search UI: Action', 'addFilter', ...arguments);

  const { driver } = this;
  const { filters } = driver.state;

  const existingFilter = filters.find((f) => f.field === name) || {}; //  && f.type === type
  const allOtherFilters = filters.filter((f) => f.field !== name) || []; // || f.type !== type
  const existingFilterValues = existingFilter.values || [];

  const newFilterValues = existingFilterValues.find((existing) =>
    doFilterValuesMatch(existing, value),
  )
    ? existingFilterValues
    : existingFilterValues.concat(value);

  driver._updateSearchResults({
    current: 1,
    filters: [
      ...allOtherFilters,
      { field: name, values: newFilterValues, type },
    ],
  });

  // return addFilter.apply(null, arguments);
}

export function removeFilter(name, value, type) {
  // debugger;
  const { driver, appConfig } = this;

  if (driver.debug)
    // eslint-disable-next-line no-console
    console.log('Search UI: Action', 'removeFilter', ...arguments);

  const { filters } = driver.state;

  let updatedFilters = filters;

  if (!value && type) {
    updatedFilters = filters.filter(
      (filter) => !(filter.field === name && filter.type === type),
    );
  } else if (value) {
    updatedFilters = removeSingleFilterValue(filters, name, value, type);
  } else {
    updatedFilters = filters.filter((filter) => filter.field !== name);
  }

  driver._updateSearchResults({
    current: 1,
    filters: updatedFilters,
  });

  const events = driver.events;

  events.emit({
    type: 'FacetFilterRemoved',
    field: name,
    value: value, //  && serialiseFilter([value])
    query: driver.state.searchTerm,
  });

  console.log('updated');

  // const filter = appConfig.facets.filter((f) => f.field === name)[0];
  //
  // const { filters } = driver.state;
  //
  // let updatedFilters = [...(filters || [])];
  //
  // if (!value && type) {
  //   if (!filter.missing) {
  //     updatedFilters = filters.filter(
  //       (filter) => !(filter.field === name && filter.type === type),
  //     );
  //   } else {
  //     updatedFilters = [
  //       ...filters.filter((filter) => filter.field !== name),
  //       { ...filter.missing, field: name },
  //     ];
  //   }
  // } else if (value) {
  //   updatedFilters = removeSingleFilterValue(filters, name, value, type);
  //   // console.log('updated', {
  //   //   name,
  //   //   value,
  //   //   type,
  //   //   updatedFilters,
  //   //   filter,
  //   //   filters,
  //   // });
  // } else {
  //   if (filter.missing) {
  //     updatedFilters = [
  //       ...filters.filter((filter) => filter.field !== name),
  //       { ...filter.missing, field: name },
  //     ];
  //   } else {
  //     updatedFilters = filters.filter((filter) => filter.field !== name);
  //   }
  // }
  //
  // console.log('I would update', { updatedFilters, filters, name, value, type });
  //
  // // if (value)
  // driver._updateSearchResults({
  //   current: 1,
  //   filters: updatedFilters,
  // });
}
