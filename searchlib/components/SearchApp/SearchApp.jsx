import React from 'react';
import { SearchView } from '@eeacms/search/components/SearchView/SearchView';

import BasicSearchApp from './BasicSearchApp';

export default function SearchApp(props) {
  React.useEffect(() => {
    console.log('mount searchapp');
    return () => console.log('unmount searchapp');
  }, []);
  console.log('redraw searchapp');
  return <BasicSearchApp {...props} searchViewComponent={SearchView} />;
}
