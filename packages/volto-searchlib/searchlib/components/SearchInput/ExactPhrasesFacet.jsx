import React from 'react';
import BooleanFacet from '@eeacms/search/components/Facets/Unconnected/BooleanFacet';
import { EXACT_PHRASES } from '@eeacms/search/constants';
import { useSearchContext } from '@eeacms/search/lib/hocs';

const ExactPhrasesFacet = (props) => {
  const searchContext = useSearchContext();
  return (
    <BooleanFacet
      {...searchContext}
      id="exact-phrases-facet"
      label="Exact phrases?"
      field={EXACT_PHRASES}
    />
  );
};

export default ExactPhrasesFacet;
