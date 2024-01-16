import React from 'react';
import HistogramFacetComponent from './HistogramFacetComponent';
import { getRangeStartEndFromData } from '@eeacms/search/lib/utils';

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
    ranges,
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
  const { data } = facet;
  const histogram_range = getRangeStartEndFromData(data, ranges);

  return (
    props.active &&
    !!facet?.data && (
      <HistogramFacetComponent
        {...props}
        data={histogram_range.ranges}
        selection={value}
        histogram_range={histogram_range}
        title={title || label}
        onChange={({ to, from }) => {
          if (
            to === histogram_range.end &&
            from === histogram_range.start &&
            isInAccordion
          ) {
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
