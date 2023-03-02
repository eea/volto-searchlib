import React from 'react';
import { SearchView } from '@eeacms/search/components/SearchView/SearchView';
import { getDefaultFilters } from '@eeacms/search/lib/utils';

import BasicSearchApp from './BasicSearchApp';

export default function SearchApp(props) {
  const { defaultSort = '' } = props;
  const [sortField, sortDirection] = defaultSort.split('|');
  const appConfig = props.registry.searchui[props.appName];
  const appDefaultFilters = getDefaultFilters(appConfig);
  const [initialState] = React.useState({
    ...(appDefaultFilters?.length
      ? {
          filters: appDefaultFilters,
        }
      : {}),
    ...(defaultSort ? { sortField, sortDirection } : {}),
  }); // this makes the prop stable

  return (
    <BasicSearchApp
      {...props}
      initialState={initialState}
      searchViewComponent={SearchView}
    />
  );
}
