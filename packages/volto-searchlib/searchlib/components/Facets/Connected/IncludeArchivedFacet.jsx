import React from 'react';
import BooleanFacet from '@eeacms/search/components/Facets/Unconnected/BooleanFacet';
import { useSearchContext } from '@eeacms/search/lib/hocs';

const IncludeArchivedFacet = (props) => {
  const searchContext = useSearchContext();
  return (
    <BooleanFacet
      {...searchContext}
      id="archived-facet"
      label="Include archived content"
      field={'IncludeArchived'}
    />
  );
};

export default IncludeArchivedFacet;
