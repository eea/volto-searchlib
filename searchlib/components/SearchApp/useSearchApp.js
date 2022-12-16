import React from 'react';

import { useAtom, useAtomValue } from 'jotai';

import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';
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

function useSearchDriver({ elasticConfig, appName }) {
  const driverAtom = driverFamily({ elasticConfig, appName });
  const driver = useAtomValue(driverAtom);

  React.useEffect(() => {
    return () => driver.tearDown();
  }, [driver]);

  return driver;
}

function useSearchApp({
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
      setIsLoading(true);
      // console.log('searching', state);
      const res = await paramOnSearch(appConfig)(state);
      // console.log('search done', res);
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

  useWhyDidYouUpdate('BasicSearchApp', {
    appName,
    registry,
    appConfig,
    driverInstance,
    facetOptions,
    onAutocomplete,
    onSearch,
    locationSearchTerm,
  });

  return {
    facetOptions,
    mapContextToProps,
    appConfig,
    driverInstance,
    elasticConfig,
  };
}

export default useSearchApp;
