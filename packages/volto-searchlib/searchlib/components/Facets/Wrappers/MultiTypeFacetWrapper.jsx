import React from 'react';

/**
 * This component enables acts as a wrapper over a facet and enables changing
 * its type
 *
 * TODO: remove this, always use withMultiTypeFilter
 */
export default function MultiTypeFacetWrapper(props) {
  const { field, addFilter, removeFilter, filters, view } = props;
  const [filterType, setFilterType] = React.useState('any');
  const filterValue = filters.find((f) => f.field === field);
  const ViewComponent = view;

  return (
    <ViewComponent
      {...props}
      filterType={filterType}
      onChangeFilterType={(filterType) => {
        if (!filterValue) {
          setFilterType(filterType);
          return;
        }
        removeFilter(field);
        const { values = [] } = filterValue || {};
        values.forEach((v) => {
          addFilter(filterValue.field, v, filterType);
        });
        setFilterType(filterType);
      }}
    />
  );
}
