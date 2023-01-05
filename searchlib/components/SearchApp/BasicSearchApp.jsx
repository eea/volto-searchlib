/**
 * Bootstraps a search view component
 *
 * Provides the search context and the driver
 */

import React from 'react';
import { SearchProvider, withSearch } from '@elastic/react-search-ui'; // ErrorBoundary,    WithSearch,
import useDeepCompareEffect from 'use-deep-compare-effect';

import { AppConfigContext, SearchContext } from '@eeacms/search/lib/hocs';
import { bindOnAutocomplete, bindOnSearch } from '@eeacms/search/lib/request';
import useSearchApp from './useSearchApp';
import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

function applySearchWrappers(SearchViewComponent) {
  function SearchWrapper(props) {
    const {
      appConfig,
      appConfigContext,
      appName,
      driver,
      facetOptions,
      mode,
      children,
      ...searchContext
    } = props;

    const [payload, update] = React.useState(appConfigContext);
    React.useEffect(() => () => console.log('unmount SearchWrappers'), []);

    return (
      <AppConfigContext.Provider value={{ payload, update }}>
        <SearchContext.Provider value={searchContext}>
          <SearchViewComponent
            {...searchContext}
            appName={appName}
            registry={appConfigContext.registry}
            appConfig={appConfig}
            mode={mode}
          >
            {children}
          </SearchViewComponent>
        </SearchContext.Provider>
      </AppConfigContext.Provider>
    );
  }
  return SearchWrapper;
}

export default function BasicSearchApp(props) {
  const {
    appName,
    registry,
    mode = 'view',
    paramOnSearch = bindOnSearch,
    paramOnAutocomplete = bindOnAutocomplete,
    searchViewComponent,
    initialState,
    uniqueId,
    ...rest
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
    initialState,
    uniqueId,
  });

  const mappedWithSearch = React.useMemo(() => withSearch(mapContextToProps), [
    mapContextToProps,
  ]);

  const [stableContext, setStableContext] = React.useState({
    appConfig,
    registry,
  });

  useDeepCompareEffect(() => {
    setStableContext({ appConfig, registry });
  }, [appConfig, registry]);

  const WrappedSearchView = React.useMemo(() => {
    return mappedWithSearch(applySearchWrappers(searchViewComponent));
  }, [mappedWithSearch, searchViewComponent]);

  useWhyDidYouUpdate('BasicSearchApp', {
    mapContextToProps,
    searchViewComponent,
    WrappedSearchView,
    registry,
  });

  return driverInstance ? (
    <SearchProvider config={elasticConfig} driver={driverInstance}>
      <WrappedSearchView
        {...rest}
        appConfig={appConfig}
        appConfigContext={stableContext}
        appName={appName}
        driver={driverInstance}
        facetOptions={facetOptions}
        mode={mode}
      />
    </SearchProvider>
  ) : null;
}
