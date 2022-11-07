// construct a data structure of all available options for all the facets

import React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import buildRequest from '@eeacms/search/lib/search/query';
import runRequest from '@eeacms/search/lib/runRequest';
import { getBuckets } from '@eeacms/search/lib/utils';
import { useIsMounted } from '@eeacms/search/lib/hocs';

export async function getFacetOptions(config, facetFieldNames) {
  let body = {
    // pass facetFieldNames as we only want the appropriate aggregations
    ...buildRequest({ filters: [] }, config, facetFieldNames),
    size: 0,
  };

  const facetsMap = Object.assign(
    {},
    ...config.facets.map((facet) => ({ [facet.field]: facet })),
  );

  const response = await runRequest(body, config);
  const aggregations = response?.body?.aggregations || {};

  return Object.assign(
    {},
    ...Object.keys(aggregations).map((name) => ({
      [name]: getBuckets({
        aggregations,
        fieldName: name,
        blacklist: facetsMap[name].blacklist,
        whitelist: facetsMap[name].whitelist,
      })?.[0]?.data?.map(({ value }) => value),
    })),
  );
}

function useFacetsWithAllOptions(appConfig) {
  const isMountedRef = useIsMounted();
  const [facetOptions, setFacetOptions] = React.useState(); // cache for all facet values, for some facets;
  const facetsWithAllOptions =
    appConfig.facets?.filter((f) => f.showAllOptions) || [];

  const fetchFacetOptions = React.useCallback(
    async (facetFieldNames) => {
      const facetNames = appConfig.facets
        .filter((f) => f.showAllOptions)
        .map((f) => f.field);
      const facetOptions = await getFacetOptions(appConfig, facetNames);
      isMountedRef.current && setFacetOptions(facetOptions);
    },
    [appConfig, isMountedRef],
  );

  useDeepCompareEffect(() => {
    fetchFacetOptions(facetsWithAllOptions);
  }, [facetsWithAllOptions, fetchFacetOptions]);

  return { facetOptions, setFacetOptions };
}
export default useFacetsWithAllOptions;
