import React from 'react';
import { SearchProvider, withSearch } from '@elastic/react-search-ui'; // ErrorBoundary,    WithSearch,

import { AppConfigContext, SearchContext } from '@eeacms/search/lib/hocs';
import {
  onResultClick,
  onAutocompleteResultClick,
  bindOnAutocomplete,
  bindOnSearch,
} from '@eeacms/search/lib/request';
import useSearchApp from './useSearchApp';

function SearchWrappers(SearchViewComponent) {
  function Wrapper(props) {
    const {
      appConfig,
      appConfigContext,
      appName,
      driver,
      facetOptions,
      mode,
      ...searchContext
    } = props;

    return (
      <AppConfigContext.Provider value={appConfigContext}>
        <SearchContext.Provider value={searchContext}>
          <SearchViewComponent
            {...searchContext}
            appName={appName}
            appConfig={appConfig}
            mode={mode}
          />
        </SearchContext.Provider>
      </AppConfigContext.Provider>
    );
  }
  return Wrapper;
}

export default function BasicSearchApp(props) {
  const {
    appName,
    registry,
    mode = 'view',
    paramOnSearch = bindOnSearch,
    paramOnAutocomplete = bindOnAutocomplete,
    searchViewComponent,
  } = props;

  const {
    mapContextToProps,
    appConfig,
    driverInstance,
    elasticConfig,
    facetOptions,
  } = useSearchApp({
    appName,
    registry,
    paramOnSearch,
    paramOnAutocomplete,
  });

  const appConfigContext = React.useMemo(() => ({ appConfig, registry }), [
    appConfig,
    registry,
  ]);

  const WrappedSearchView = React.useMemo(() => {
    return withSearch(mapContextToProps)(SearchWrappers(searchViewComponent));
  }, [mapContextToProps, searchViewComponent]);

  React.useEffect(() => {
    console.log('mount basicsearchapp');
    return () => console.log('unmount basicsearchapp');
  }, []);

  // console.log('redraw basicsearchapp', isLoading);

  return driverInstance ? (
    <SearchProvider config={elasticConfig} driver={driverInstance}>
      <WrappedSearchView
        appConfig={appConfig}
        appConfigContext={appConfigContext}
        appName={appName}
        driver={driverInstance}
        facetOptions={facetOptions}
        mode={mode}
      />
    </SearchProvider>
  ) : null;
}
