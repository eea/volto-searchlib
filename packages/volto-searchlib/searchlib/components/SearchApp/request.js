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

export function clearFilters(except = [], options) {
  // TODO: tibi add options
  const { setFilter } = this.driver;

  this.driver.clearFilters(except);
  this.appConfig.facets
    .filter((f) => !!f.default)
    .forEach((facet) => {
      const fdefault =
        typeof facet.default === 'function'
          ? facet.default(options)
          : facet.default;
      fdefault.values.forEach((value) => {
        setFilter(facet.field, value, fdefault.type || 'any');
      });
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
      {
        field: name,
        values: newFilterValues,
        type,
      },
    ],
  });
}

export function setSort({ field, sortOn, sortOrder }) {
  if (!field) {
    return;
  }

  const { driver } = this;
  const { sortList } = driver.state;

  // console.log({ sortList });

  let sortOptions = [];
  const existingSort = sortList.filter((item) => item.field === field);

  if (existingSort.length === 0) {
    sortOptions = [...sortList, { field, sortOn, sortOrder }];
  } else {
    sortOptions = sortList.map((item) => {
      if (item.field === field) {
        return { field, sortOn, sortOrder };
      }
      return item;
    });
  }

  driver._updateSearchResults({
    sortList: sortOptions,
  });
}

export function removeFilter(name, value, type) {
  const { driver, appConfig } = this;

  const filter = appConfig.facets.filter((f) => f.field === name)[0];

  const { filters } = driver.state;

  let updatedFilters = [...(filters || [])];

  if (!value && type) {
    if (!filter?.missing) {
      updatedFilters = filters.filter(
        (filter) => !(filter.field === name && filter.type === type),
      );
    } else {
      updatedFilters = [
        ...filters.filter((filter) => filter.field !== name),
        { ...filter?.missing, field: name },
      ];
    }
  } else if (value) {
    updatedFilters = removeSingleFilterValue(filters, name, value, type);
    // console.log('updated', {
    //   name,
    //   value,
    //   type,
    //   updatedFilters,
    //   filter,
    //   filters,
    // });
  } else {
    if (filter.missing) {
      updatedFilters = [
        ...filters.filter((filter) => filter.field !== name),
        { ...filter.missing, field: name },
      ];
    } else {
      updatedFilters = filters.filter((filter) => filter.field !== name);
    }
  }

  // console.log('I would update', { updatedFilters, filters, name, value, type });

  driver._updateSearchResults({
    current: 1,
    filters: updatedFilters,
  });
}
