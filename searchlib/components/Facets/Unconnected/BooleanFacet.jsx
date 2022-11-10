import React from 'react';
import { Radio } from 'semantic-ui-react';
import { useWindowDimensions } from '@eeacms/search/lib/hocs';

const truthy = (val) => {
  if (typeof val === 'string') {
    return val === 'true' ? true : false;
  }
  return val;
};

export const BooleanFacetComponent = (props) => {
  const {
    setFilter,
    filters,
    removeFilter,
    label,
    field,
    id,
    domProps = {},
  } = props;
  const filter = filters.find((filter) => filter.field === field);
  const value = filter ? truthy(filter.values[0]) : false;

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 550;
  let textLabel = label;
  if (isSmallScreen && label === 'Include archived content') {
    textLabel = 'Archived'; // TODO: shortLabel as setting in facets config?
  }

  return (
    <div className="boolean-facet" {...domProps} id={id}>
      <Radio
        toggle
        label={textLabel}
        checked={value}
        onChange={(e, { checked }) => {
          if (checked) {
            setFilter(field, checked, 'none');
          } else {
            removeFilter(field);
          }
        }}
      />
    </div>
  );
};

export default BooleanFacetComponent;
