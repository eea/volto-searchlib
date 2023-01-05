import React from 'react';

import { useAtom } from 'jotai';
import useDeepCompareEffect, {
  useDeepCompareEffectNoCheck,
} from 'use-deep-compare-effect';

import {
  getDefaultFilters,
  rebind,
  applyConfigurationSchema,
} from '@eeacms/search/lib/utils';
import {
  onResultClick,
  onAutocompleteResultClick,
} from '@eeacms/search/lib/request';

import { resetFilters, resetSearch } from './request';
import useFacetsWithAllOptions from './useFacetsWithAllOptions';
import { loadingFamily } from './state';
import { SearchDriver } from '@elastic/search-ui';
// import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

export function useStoredSearchDriver({ elasticConfig, appName, uniqueId }) {
  const [driver, setDriver] = React.useState(null);

  useDeepCompareEffect(() => {
    setDriver(new SearchDriver(elasticConfig));
  }, [elasticConfig, appName]);

  // useWhyDidYouUpdate('setStoredSearchDriver', { elasticConfig, appName });

  React.useEffect(() => {
    return () => {
      // console.log('unmount useStoredSearchDriver');
      driver && driver.tearDown();
    };
  }, [driver]);

  return driver;
}

export default function useSearchApp(props) {
  const {
    appName,
    registry,
    paramOnSearch,
    paramOnAutocomplete,
    initialState,
  } = props;
  // useWhyDidYouUpdate('sss', props);

  const appConfig = React.useMemo(() => {
    // console.log('redo appConfig');
    return {
      ...applyConfigurationSchema(rebind(registry.searchui[appName])),
      appName,
    };
  }, [appName, registry]);

  const loadingAtom = loadingFamily(appName);
  const [, setIsLoading] = useAtom(loadingAtom);

  const onSearch = React.useCallback(
    async (state) => {
      if (appConfig.url) return {}; // we don't do onSearch if we rely on another page to do the search

      setIsLoading(true);
      const res = await paramOnSearch(appConfig)(state);
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
      // we don't want to track the URL if our search app is configured as
      // a simple separate app (for ex. search input or landing page that
      // trampolines to another instance)
      trackUrlState: appConfig.url ? false : appConfig.trackUrlState,
    }),
    [appConfig, onAutocomplete, onSearch, locationSearchTerm, initialState],
  );

  const { facetOptions } = React.useState(useFacetsWithAllOptions(appConfig));

  const [driverInstance, setDriver] = React.useState(null);

  useDeepCompareEffectNoCheck(() => {
    if (!driverInstance) {
      const driver = new SearchDriver(elasticConfig);
      // console.log('set driver', driver);
      setDriver(driver);
    }
  }, [appName]);

  // const driverInstance = useStoredSearchDriver({
  //   elasticConfig,
  //   appName,
  //   uniqueId,
  // });

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
