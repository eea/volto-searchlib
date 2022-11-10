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
