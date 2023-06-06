import React from 'react';
import { SearchView } from '@eeacms/search/components/SearchView/SearchView';
import { getDefaultFilters } from '@eeacms/search/lib/utils';
import qs from 'querystring';

import BasicSearchApp from './BasicSearchApp';

const getParams = (s) => (s ? (s.startsWith('?') ? s.slice(1) : s) : '');

export default function SearchApp(props) {
  const locationSearch = __CLIENT__
    ? qs.parse(getParams(window.location.search))?.['q']
    : null;
  const defaultSort = locationSearch ? '' : props.defaultSort || '';
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

  // console.log({
  //   appConfig,
  //   props,
  //   sortField,
  //   sortDirection,
  //   locationSearch,
  //   search: __CLIENT__ ? window.location.search : null,
  //   parsed: __CLIENT__ ? qs.parse(getParams(window.location.search)) : null,
  //   initialState,
  // });

  return (
    <BasicSearchApp
      {...props}
      initialState={initialState}
      searchViewComponent={SearchView}
    />
  );
}
