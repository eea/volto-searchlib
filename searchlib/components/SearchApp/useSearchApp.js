import React from 'react';

import { useDeepCompareEffectNoCheck } from 'use-deep-compare-effect'; // useDeepCompareEffect,
import { trackSiteSearch } from '@eeacms/volto-matomo/utils';

import {
  getDefaultFilters,
  rebind,
  applyConfigurationSchema,
} from '@eeacms/search/lib/utils';
import {
  onResultClick,
  onAutocompleteResultClick,
} from '@eeacms/search/lib/request';

import {
  removeFilter,
  clearFilters,
  resetFilters,
  resetSearch,
  addFilter,
  setSort,
} from './request';
import useFacetsWithAllOptions from './useFacetsWithAllOptions';
import { useLoadingState } from './state';
import { SearchDriver } from '@elastic/search-ui';

// import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

// export function useStoredSearchDriver({ elasticConfig, appName, uniqueId }) {
//   const [driver, setDriver] = React.useState(null);
//
//   useDeepCompareEffect(() => {
//     setDriver(new SearchDriver(elasticConfig));
//   }, [elasticConfig, appName]);
//
//   // useWhyDidYouUpdate('setStoredSearchDriver', { elasticConfig, appName });
//
//   React.useEffect(() => {
//     return () => {
//       // console.log('unmount useStoredSearchDriver');
//       driver && driver.tearDown();
//     };
//   }, [driver]);
//
//   return driver;
// }

export default function useSearchApp(props) {
  const {
    appName,
    registry,
    paramOnSearch,
    paramOnAutocomplete,
    initialState,
    mode = 'view',
  } = props;
  // useWhyDidYouUpdate('sss', props);

  const appConfig = React.useMemo(() => {
    return {
      ...applyConfigurationSchema(rebind(registry.searchui[appName])),
      appName,
    };
  }, [appName, registry]);

  const [, setIsLoading] = useLoadingState(appName);

  const onSearch = React.useCallback(
    async (state) => {
      if (appConfig.url) return {}; // we don't do onSearch if we rely on another page to do the search

      setIsLoading(true);
      const res = await paramOnSearch(appConfig)(state);
      setIsLoading(false);

      const searchTerm = state.searchTerm?.trim();
      if (appConfig.enableMatomoTracking && searchTerm.length > 0) {
        trackSiteSearch({
          keyword: searchTerm,
          category: appName,
          count: res.totalResults,
        });
      }

      return res;
    },
    [appConfig, appName, paramOnSearch, setIsLoading],
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

  // we don't want to track the URL if our search app is configured as
  // a simple separate app (for ex. search input or landing page that
  // trampolines to another instance)
  const trackUrlState =
    mode === 'edit' ? false : appConfig.url ? false : appConfig.trackUrlState;

  const elasticConfig = React.useMemo(
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
        ...(initialState || {}),
      },
      trackUrlState,
    }),
    [
      appConfig,
      onAutocomplete,
      onSearch,
      locationSearchTerm,
      initialState,
      trackUrlState,
    ],
  );

  // console.log('elasticConfig', elasticConfig);

  const { facetOptions } = React.useState(useFacetsWithAllOptions(appConfig));

  const [driverInstance, setDriver] = React.useState(null);

  useDeepCompareEffectNoCheck(() => {
    if (!driverInstance) {
      const driver = new SearchDriver(elasticConfig);
      // console.log('set driver', driver, appName);
      setDriver(driver);
    }
  }, [appName]);

  const mapContextToProps = React.useCallback(
    (params) => {
      const driver = driverInstance;
      const searchContext = {
        ...params,
        driver,
        facetOptions,
      };
      const funcs = {
        resetFilters,
        resetSearch,
        clearFilters,
        removeFilter,
        addFilter,
        setSort,
      };
      Object.keys(funcs).forEach((name) => {
        searchContext[name] = funcs[name].bind({
          appConfig,
          searchContext,
          driver,
        });
      });
      return searchContext;
    },
    [appConfig, driverInstance, facetOptions],
  );

  // useWhyDidYouUpdate('useSearchApp', {
  //   appConfig,
  //   driverInstance,
  //   facetOptions,
  //   registry,
  //   onAutocomplete,
  //   onSearch,
  //   locationSearchTerm,
  //   initialState,
  // });

  React.useEffect(() => {
    return () => {
      driverInstance && driverInstance.tearDown();
    };
  }, [driverInstance]);

  // React.useEffect(() => {
  //   return () => console.log('unmount useSearchApp');
  // }, []);

  return {
    facetOptions,
    mapContextToProps,
    appConfig,
    driverInstance,
    elasticConfig,
  };
}
