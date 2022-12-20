import React from 'react';
import { FacetApp } from '@eeacms/search';

export default function FacetValueWidget(props) {
  const { facetName, onChange, id } = props;
  const onChangeHandler = React.useCallback(
    (filters) => onChange(id, filters),
    [id, onChange],
  );
  return facetName ? (
    <FacetApp {...props} field={facetName} onChange={onChangeHandler} />
  ) : null;
}
