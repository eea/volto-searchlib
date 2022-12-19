import React from 'react';

import registry from '@eeacms/search/registry';
import { AppConfigContext } from '@eeacms/search/lib/hocs';

import BasicSearchApp from './BasicSearchApp';
import { SearchBox } from '@eeacms/search/components';

const SearchInputView = (props) => {
  const {
    mode = 'view',
    appConfigContext,
    appConfig,
    ...searchContext
  } = props;

  const onSubmit = appConfig.url
    ? (searchTerm) => {
        console.log('submit', searchTerm);
      }
    : undefined;

  const onSelectAutocomplete = appConfig.url
    ? (selection, options) => {
        console.log('onselect', selection, options, searchContext);
        searchContext.setSearchTerm(selection.suggestion);
      }
    : undefined;

  return (
    <SearchBox
      searchContext={searchContext}
      isLandingPage={false}
      autocompleteMinimumCharacters={3}
      autocompleteResults={appConfig.autocomplete.results}
      autocompleteSuggestions={appConfig.autocomplete.suggestions}
      shouldClearFilters={false}
      useSearchPhrases={appConfig.useSearchPhrases}
      inputView={
        appConfig.searchBoxInputComponent
          ? registry.resolve[appConfig.searchBoxInputComponent].component
          : undefined
      }
      view={
        appConfig.searchBoxComponent
          ? registry.resolve[appConfig.searchBoxComponent].component
          : undefined
      }
      mode={mode}
      onSubmit={onSubmit}
      onSelectAutocomplete={onSelectAutocomplete}
    />
  );
};

const SearchInputViewWrapper = (props) => {
  return (
    <AppConfigContext.Consumer>
      {(context) => <SearchInputView appConfigContext={context} {...props} />}
    </AppConfigContext.Consumer>
  );
};

export default function SearchApp(props) {
  return (
    <BasicSearchApp {...props} searchViewComponent={SearchInputViewWrapper} />
  );
}
