import getRegistry from '@eeacms/search/lib/getRegistry';

export default function buildStateFacets(aggregations, config) {
  const { facets } = config;
  const facetsMap = Object.assign(
    {},
    ...facets.map((facet) => {
      return { [facet.field]: getRegistry().resolve[facet.factory] };
    }),
  );

  const result = Object.assign(
    {},
    ...facets.map((facet) => {
      const { getValue } = facetsMap[facet.field];
      if (!getValue) return {};
      const value = getValue({
        aggregations,
        fieldName: facet.field,
        whitelist: facet.whitelist,
        blacklist: facet.blacklist,
        config,
      });
      return value ? { [facet.field]: value } : {};
    }),
  );
  if (Object.keys(result).length > 0) {
    return result;
  }
}
