import React from 'react';
import { FacetApp } from '@eeacms/search';

export default function FacetValueWidget(props) {
  const { facetName, onChange, id } = props;
  const onChangeHandler = React.useCallback(
    (filters) => {
      console.log('onchange', filters);
      onChange(
        id,
        filters.find(({ field }) => field === facetName),
      );
    },
    [id, onChange, facetName],
  );
  return facetName ? (
    <FacetApp {...props} field={facetName} onChange={onChangeHandler} />
  ) : null;
}
