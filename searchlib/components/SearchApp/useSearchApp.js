import React from 'react';

import { useAtom } from 'jotai';
import { SearchDriver } from '@elastic/search-ui';

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
import { loadingFamily } from './state';

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
      // trackUrlState: false,
      debug: true,
    }),
    [appConfig, onAutocomplete, onSearch, locationSearchTerm],
  );

  const { facetOptions } = React.useState(useFacetsWithAllOptions(appConfig));

  const driver = React.useMemo(
    () => (__CLIENT__ ? new SearchDriver(elasticConfig) : null),
    [elasticConfig],
  );
  const [driverInstance] = React.useState(driver);

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
