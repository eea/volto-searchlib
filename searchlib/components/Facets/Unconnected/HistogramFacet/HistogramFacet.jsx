import React from 'react';
import HistogramFacetComponent from './HistogramFacetComponent';

const HistogramFacet = (props) => {
  // We're using the facet information to get the available values for the
  // filter. This is a type of range filter

  const {
    facets,
    filters,
    field,
    state,
    title,
    label,
    onChange,
    onRemove,
    isInAccordion,
  } = props; // , filters
  const filterValue = filters.find((f) => f.field === field);

  // copied from react-search-ui/Facet.jsx
  // By using `[0]`, we are currently assuming only 1 facet per field. This
  // will likely be enforced in future version, so instead of an array, there
  // will only be one facet allowed per field.
  const facetsForField = facets[field];
  const facet = facetsForField?.[0] || {};

  const value = state?.length
    ? [state[0].from, state[0].to]
    : filterValue
    ? [filterValue.values?.[0]?.from, filterValue.values?.[0]?.to]
    : null;
  const range_start = facet.data[0].value.from;
  const range_end = facet.data[facet.data.length - 1].value.to;
  // console.log('rendering', field, facet?.data);
  return (
    props.active &&
    !!facet?.data && (
      <HistogramFacetComponent
        {...props}
        data={facet?.data}
        selection={value}
        title={title || label}
        onChange={({ to, from }) => {
          if (to === range_end && from === range_start && isInAccordion) {
            if (value) {
              const v = { to: value[1], from: value[0], type: 'range' };
              onRemove(v);
            }
          } else {
            if (to || from) {
              // removeFilter(field, null, 'range');
              // console.log('onselect', field);
              // onSelect([{ to, from, type: 'range' }], true);
              onChange({ to, from, type: 'range' });
            } else {
              onChange({});
            }
          }
        }}
      />
    )
  );
};

export default HistogramFacet;
