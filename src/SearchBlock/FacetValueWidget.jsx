import React from 'react';
import { FacetApp } from '@eeacms/search';
import { isEqual } from 'lodash';

export default function FacetValueWidget(props) {
  const { facetName, onChange, id, value } = props;
  const onChangeHandler = React.useCallback(
    (newValue) => {
      if (!isEqual(newValue, value)) {
        console.log('onchange', value, newValue);
        onChange(id, newValue);
      }
    },
    [id, onChange, value],
  );
  return facetName ? (
    <FacetApp {...props} field={facetName} onChange={onChangeHandler} />
  ) : null;
}
