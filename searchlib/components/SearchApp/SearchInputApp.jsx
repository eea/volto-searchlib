import React from 'react';

import registry from '@eeacms/search/registry';
import BasicSearchApp from './BasicSearchApp';
import { SearchBox } from '@eeacms/search/components';

const SearchInputView = (props) => {
  const { mode = 'view', appConfig, ...searchContext } = props;
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
    />
  );
};

export default function SearchApp(props) {
  return <BasicSearchApp {...props} searchViewComponent={SearchInputView} />;
}
