import React from 'react';
import { useAtom } from 'jotai';
import { moreLikeThisAtom, showFacetsAsideAtom } from '@eeacms/search/state';
import { useSearchContext } from '@eeacms/search/lib/hocs';

const MoreLikeThisTrigger = ({ view: View, result, ...rest }) => {
  const context = useSearchContext();
  const { setFilter, setSearchTerm } = context;

  const [, setMoreLikeThis] = useAtom(moreLikeThisAtom);
  const [, setOpenFacets] = useAtom(showFacetsAsideAtom);

  return (
    <View
      onClick={() => {
        setSearchTerm('');
        context.resetFilters();
        setMoreLikeThis(result);
        setFilter('moreLikeThis', result._original._id, 'none');
        setOpenFacets(true);
      }}
      {...rest}
    />
  );
};

export default MoreLikeThisTrigger;
