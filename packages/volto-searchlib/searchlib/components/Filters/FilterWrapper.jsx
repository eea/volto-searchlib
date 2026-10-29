/**
 * Unfinished!!!
 *
 */

import React from 'react';
import { markSelectedFacetValuesFromFilters } from '@eeacms/search/lib/search/helpers';
import { useSearchContext } from '@eeacms/search/lib/hocs';

export const accentFold = (str = '') =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const FilterContainer = (props) => {
  // console.log('myprops', props);

  const {
    className,
    id,
    field,
    filterType = 'all',
    label,
    view,
    isFilterable = false,
    ...rest
  } = props;
  const searchContext = useSearchContext();

  const { filters, facets, addFilter, removeFilter, setFilter } = searchContext;

  const facetsForField = facets[field];

  if (!facetsForField) return null;

  // By using `[0]`, we are currently assuming only 1 facet per field. This
  // will likely be enforced in future version, so instead of an array, there
  // will only be one facet allowed per field.
  const facet = facetsForField[0];
  const more = 100;

  let facetValues = markSelectedFacetValuesFromFilters(
    facet,
    filters,
    field,
    filterType,
  ).data;

  // console.log({ facet, facetValues, filters, field, filterType });

  const selectedValues = facetValues
    .filter((fv) => fv.selected)
    .map((fv) => fv.value);

  if (!facetValues.length && !selectedValues.length) return null;
  const View = view; //  || MultiCheckboxFacet

  return (
    <View
      className={className}
      label={label}
      onRemove={(value) => {
        removeFilter(field, value, filterType);
      }}
      onChange={(value) => {
        setFilter(field, value, filterType);
      }}
      onSelect={(value) => {
        addFilter(field, value, filterType);
      }}
      options={facetValues.slice(0, more)}
      showMore={facetValues.length > more}
      values={selectedValues}
      showSearch={isFilterable}
      searchPlaceholder={`Filter ${field}`}
      {...rest}
    />
  );
};

export default FilterContainer;
