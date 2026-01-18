import React from 'react';

import { useAppConfig } from '@eeacms/search/lib/hocs';

import BasicSearchApp from './BasicSearchApp';
import { SearchBox } from '@eeacms/search/components';

const BootstrapSearchInputView = (props) => {
  const { mode = 'view', appConfig, onSubmitSearch, ...searchContext } = props;
  const { registry } = useAppConfig();

  const onSubmit = appConfig.url
    ? (searchTerm) => {
        onSubmitSearch(searchTerm);
      }
    : undefined;

  const onSelectAutocomplete = appConfig.url
    ? (selection, options) => {
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
      // useSearchPhrases={appConfig.useSearchPhrases}
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
  return <BootstrapSearchInputView {...props} />;
};

export default function SearchInputApp(props) {
  return (
    <BasicSearchApp {...props} searchViewComponent={SearchInputViewWrapper} />
  );
}
