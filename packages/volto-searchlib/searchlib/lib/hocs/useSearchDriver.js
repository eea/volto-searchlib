import React from 'react';
import { SearchContext } from '@elastic/react-search-ui';

export default function useSearchDriver() {
  const context = React.useContext(SearchContext);
  return context ? context.driver : null;
}
