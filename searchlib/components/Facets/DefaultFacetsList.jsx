/*
 * Used for Classic Theme
 * with:
 * facetsListComponent: 'DefaultFacetsList',
 * searchBoxInputComponent: 'SimpleSearchInput',
 *
 * facets: [
 *   suiFacet({
 *     field: 'Field name',
 *     label: 'Field label',
 *     isMulti: true,
 *     isFilterable: false,
 *     show: 100,
 *     factory: 'MultiTermFacet',
 *     wrapper: 'AccordionFacetWrapper',
 *   }),
 * ...
 * ]
 */

import React from 'react';
import { useAtom } from 'jotai';

import { AccordionFacetWrapper } from '@eeacms/search/components';
import { showFacetsAsideAtom } from '@eeacms/search/state';
import { useSearchContext } from '@eeacms/search/lib/hocs';

import FacetsList from './FacetsList';

export default (props) => {
  const [, setShowFacets] = useAtom(showFacetsAsideAtom);
  const searchContext = useSearchContext();
  const hasFilters = searchContext.filters.length > 0;

  React.useEffect(() => {
    if (hasFilters) setShowFacets(true);
  }, [hasFilters, setShowFacets]);

  return (
    <div className="facets-list">
      <FacetsList
        defaultWraper={AccordionFacetWrapper}
        view={({ children }) => (
          <div className="facets-inner"> {children} </div>
        )}
      />
    </div>
  );
};
