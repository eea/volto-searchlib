import React from 'react';
import { SearchView } from '@eeacms/search/components/SearchView/SearchView';

import BasicSearchApp from './BasicSearchApp';

export default function SearchApp(props) {
  return <BasicSearchApp {...props} searchViewComponent={SearchView} />;
}
