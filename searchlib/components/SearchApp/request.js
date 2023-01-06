import { resetFiltersToDefault } from '@eeacms/search/lib/search/helpers';
import { getDefaultFilters } from '@eeacms/search/lib/utils';

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
