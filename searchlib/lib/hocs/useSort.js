import React from 'react';
import { customOrder } from '@eeacms/search/lib/utils';
import { useAppConfig } from '@eeacms/search/lib/hocs';

const useSort = (
  values,
  criterias,
  { defaultSortOn, defaultSortOrder },
  field = null, // in case of custom order, we get the facetValues order from field's configuration
) => {
  const [sortOn, setSortOn] = React.useState(defaultSortOn);
  const [sortOrder, setSortOrder] = React.useState(defaultSortOrder[sortOn]);
  const { appConfig } = useAppConfig();

  const toggleSort = (name) => {
    if (sortOn === name) {
      // toggle sort direction;
      setSortOrder(sortOrder === 'ascending' ? 'descending' : 'ascending');
      return;
    } else {
      setSortOrder(defaultSortOrder[name]);
      setSortOn(name);
    }
  };

  const sorter = (options) => {
    if (sortOn === 'custom') {
      const fConfig = appConfig.facets.filter((f) => f.field === field);
      const facetValues = fConfig[0].facetValues;

      return sortOrder === 'ascending'
        ? customOrder(options, facetValues, 'ascending')
        : customOrder(options, facetValues, 'descending');
    } else {
      return Array.from(options).sort((a, b) => {
        return sortOrder === 'ascending'
          ? a[sortOn] > b[sortOn]
            ? a[sortOn] !== b[sortOn]
              ? 1
              : 0
            : -1
          : b[sortOn] > a[sortOn]
          ? b[sortOn] !== a[sortOn]
            ? 1
            : 0
          : -1;
      });
    }
  };

  return {
    sortedValues: sorter(values),
    sorting: { sortOn, sortOrder },
    toggleSort,
  };
};

export default useSort;
