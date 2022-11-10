import {
  applyDisjunctiveFaceting,
  buildRequest,
  buildState,
  getAutocompleteSuggestions,
} from './search';
import { default as runRequest } from './runRequest';

export function onResultClick() {
  /* Not implemented */
}

export function onAutocompleteResultClick() {
  /* Not implemented */
}

export const bindOnAutocomplete = (config) =>
  async function onAutocomplete(props) {
    return {
      autocompletedSuggestions: await getAutocompleteSuggestions(props, config),
      autocompletedResults: [],
    };
  };

export const bindOnSearch = (config) =>
  async function onSearch(state) {
    const { resultsPerPage } = state;
    const requestBody = buildRequest(state, config);

    // Note that this could be optimized by running all of these requests
    // at the same time. Kept simple here for clarity.
    const responseJson = await runRequest(requestBody, config);

    const { body } = responseJson;

    const responseJsonWithDisjunctiveFacetCounts = await applyDisjunctiveFaceting(
      body,
      state,
      config,
    );

    const newState = buildState(
      responseJsonWithDisjunctiveFacetCounts,
      resultsPerPage,
      config,
    );

    return { filters: state.filters, ...newState }; //{ ...state, ...newState };
  };
