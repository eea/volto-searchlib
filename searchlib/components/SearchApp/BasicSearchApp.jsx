/**
 * Bootstraps a search view component
 *
 * Provides the search context and the driver
 */

import React from 'react';
import { SearchProvider, withSearch } from '@elastic/react-search-ui'; // ErrorBoundary,    WithSearch,

import { AppConfigContext, SearchContext } from '@eeacms/search/lib/hocs';
import { bindOnAutocomplete, bindOnSearch } from '@eeacms/search/lib/request';
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

    const [payload, update] = React.useState(appConfigContext);

    return (
      <AppConfigContext.Provider value={{ payload, update }}>
        <SearchContext.Provider value={searchContext}>
          <SearchViewComponent
            {...searchContext}
            appName={appName}
            registry={appConfigContext.registry}
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

  const appConfigContext = React.useMemo(() => {
    return { appConfig, registry };
  }, [appConfig, registry]);

  const WrappedSearchView = React.useMemo(() => {
    return withSearch(mapContextToProps)(SearchWrappers(searchViewComponent));
  }, [mapContextToProps, searchViewComponent]);

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
