import React from 'react';
import { Segment } from 'semantic-ui-react';
import { ModalFacetWrapper } from '@eeacms/search/components';
import { useAtom } from 'jotai';
import { showFacetsAsideAtom } from '@eeacms/search/state';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import FacetsList from './FacetsList';

export default (props) => {
  const [showFacets, setShowFacets] = useAtom(showFacetsAsideAtom);
  const searchContext = useSearchContext();
  const hasFilters = searchContext.filters.length > 0;

  React.useEffect(() => {
    if (hasFilters) setShowFacets(true);
  }, [hasFilters, setShowFacets]);

  return (
    <>
      {showFacets ? (
        <Segment className="facetslist-wrapper top-facetslist-wrapper">
          <FacetsList
            defaultWraper={ModalFacetWrapper}
            view={({ children }) => (
              <div className="facets-wrapper">{children}</div>
            )}
          />
        </Segment>
      ) : null}
    </>
  );
};
