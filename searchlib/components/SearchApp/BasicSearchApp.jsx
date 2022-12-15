import React from 'react';
import { useAtom } from 'jotai';

import { SearchProvider, withSearch } from '@elastic/react-search-ui'; // ErrorBoundary,    WithSearch,
import { AppConfigContext, SearchContext } from '@eeacms/search/lib/hocs';
import { rebind, applyConfigurationSchema } from '@eeacms/search/lib/utils';
import {
  onResultClick,
  onAutocompleteResultClick,
  bindOnAutocomplete,
  bindOnSearch,
} from '@eeacms/search/lib/request';
import { getDefaultFilters } from '@eeacms/search/lib/utils';
import { resetFilters, resetSearch } from './request';
import useFacetsWithAllOptions from './useFacetsWithAllOptions';
import { SearchDriver } from '@elastic/search-ui';
import { loadingFamily } from './state';

function useWhyDidYouUpdate(name, props) {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = React.useRef();
  React.useEffect(() => {
    if (previousProps.current) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      // Use this object to keep track of changed props
      const changesObj = {};
      // Iterate through keys
      allKeys.forEach((key) => {
        // If previous is different from current
        if (previousProps.current[key] !== props[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });
      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj);
      }
    }
    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  });
}

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

function BasicSearchApp(props) {
  const {
    appName,
    registry,
    mode = 'view',
    paramOnSearch = bindOnSearch,
    paramOnAutocomplete = bindOnAutocomplete,
    searchViewComponent,
  } = props;

  const appConfig = React.useMemo(
    () => ({
      ...applyConfigurationSchema(rebind(registry.searchui[appName])),
      appName,
    }),
    [appName, registry],
  );

  const appConfigContext = React.useMemo(() => ({ appConfig, registry }), [
    appConfig,
    registry,
  ]);

  const loadingAtom = loadingFamily(appName);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);
  // const [isLoading, setIsLoading] = React.useState(false);

  const onSearch = React.useCallback(
    async (state) => {
      setIsLoading(true);
      console.log('searching');
      const res = await paramOnSearch(appConfig)(state);
      console.log('search done', res);
      setIsLoading(false);
      return res;
    },
    [appConfig, paramOnSearch, setIsLoading],
  );

  const onAutocomplete = React.useMemo(() => paramOnAutocomplete(appConfig), [
    appConfig,
    paramOnAutocomplete,
  ]);

  const locationSearchTerm = React.useMemo(
    () =>
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('q')
        : null,
    [],
  );

  const config = React.useMemo(
    () => ({
      ...appConfig,
      onResultClick,
      onAutocompleteResultClick,
      onAutocomplete,
      onSearch,
      initialState: {
        resultsPerPage: appConfig.resultsPerPage || 20,
        ...(locationSearchTerm
          ? { filters: getDefaultFilters(appConfig) }
          : {}),
      },
    }),
    [appConfig, onAutocomplete, onSearch, locationSearchTerm],
  );

  const { facetOptions } = useFacetsWithAllOptions(appConfig);

  const [driverInstance] = React.useState(
    __CLIENT__ ? new SearchDriver(config) : null,
  );

  const mapContextToProps = React.useCallback(
    (params) => {
      const driver = driverInstance;
      const searchContext = {
        ...params,
        driver,
        facetOptions,
      };
      searchContext.resetFilters = resetFilters.bind({
        appConfig,
        searchContext,
      });
      searchContext.resetSearch = resetSearch.bind({
        appConfig,
        searchContext,
        driver,
      });
      return searchContext;
    },
    [appConfig, driverInstance, facetOptions],
  );

  useWhyDidYouUpdate('BasicSearchApp', {
    appConfig,
    driverInstance,
    facetOptions,
    searchViewComponent,
  });

  const WrappedSearchView = React.useMemo(() => {
    console.log('WrappedSearchView redo');
    return withSearch(mapContextToProps)(SearchWrappers(searchViewComponent));
  }, [mapContextToProps, searchViewComponent]);

  React.useEffect(() => () => console.log(''), []);

  React.useEffect(() => {
    console.log('mount basicsearchapp');
    return () => console.log('unmount basicsearchapp');
  }, []);

  console.log('redraw basicsearchapp');

  return driverInstance ? (
    <SearchProvider config={config} driver={driverInstance}>
      <WrappedSearchView
        appConfig={appConfig}
        appConfigContext={appConfigContext}
        appName={appName}
        driver={driverInstance}
        facetOptions={facetOptions}
        isLoading={isLoading}
        mode={mode}
      />
    </SearchProvider>
  ) : null;
}

export default React.memo(BasicSearchApp, () => true);
