import React from 'react';

import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';
import { useAtom, useAtomValue } from 'jotai';

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
import { loadingFamily, driverFamily } from './state';

export function useSearchDriver({ elasticConfig, appName }) {
  const driverAtom = driverFamily({ elasticConfig, appName });
  const driver = useAtomValue(driverAtom);

  React.useEffect(() => {
    return () => driver.tearDown();
  }, [driver]);

  return driver;
}

export default function useSearchApp({
  appName,
  registry,
  paramOnSearch,
  paramOnAutocomplete,
}) {
  const appConfig = React.useMemo(
    () => ({
      ...applyConfigurationSchema(rebind(registry.searchui[appName])),
      appName,
    }),
    [appName, registry],
  );

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
      },
    }),
    [appConfig, onAutocomplete, onSearch, locationSearchTerm],
  );

  const { facetOptions } = React.useState(useFacetsWithAllOptions(appConfig));

  const driverInstance = useSearchDriver({ elasticConfig, appName });

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
  //   driverInstance,
  //   facetOptions,
  //   mapContextToProps,
  //   appConfig,
  //   registry,
  // });
  //
  // React.useEffect(
  //   () => () => {
  //     console.log('unmount useSearchApp');
  //   },
  //   [],
  // );

  return {
    facetOptions,
    mapContextToProps,
    appConfig,
    driverInstance,
    elasticConfig,
  };
}
