import React from 'react';
import { FacetApp } from '@eeacms/search';
import { isEqual } from 'lodash';

export default function FacetValueWidget(props) {
  const { facetName, value, onChange, id } = props;
  const onChangeHandler = React.useCallback(
    (newValue) => {
      if (!isEqual(newValue, value)) {
        onChange(id, newValue);
      }
    },
    [id, onChange, value],
  );
  return facetName ? (
    <FacetApp {...props} field={facetName} onChange={onChangeHandler} />
  ) : null;
}
