/**
 * "Factory" methods. These are simple helpers that return configuration
 * objects for facet components
 */

import { isFunction } from '@eeacms/search/utils';

const defaults = {
  // filterListComponent: 'FilterResultEntry',
};

export const histogramFacet = ({
  field,
  label,
  isFilterable = false,
  ...params
}) => {
  return {
    ...defaults,
    field,
    factory: 'HistogramFacet',
    label: label || field,
    height: 100, // default height of the histogram
    showInFacetsList: true,
    isFilterable,
    ...params,
  };
};

export const suiFacet = ({
  field,
  label,
  filterType = 'any',
  isFilterable = false,
  ...params
}) => {
  return {
    ...defaults,
    field,
    factory: 'searchui.Facet',
    label: label || field,
    showInFacetsList: true,
    filterType,
    isFilterable,
    show: 10000,
    ...params,
  };
};

export const suiRangeFacet = ({
  field,
  label,
  filterType = 'any',
  isFilterable = false,
  ...params
}) => {
  return {
    ...defaults,
    field,
    factory: 'searchui.RangeFacet',
    label: label || field,
    showInFacetsList: true,
    filterType,
    isFilterable,
    ...params,
  };
};

export const multiTermFacet = ({
  field,
  label,
  filterType = 'any',
  isFilterable = false,
  ...params
}) => {
  return {
    ...defaults,
    field,
    factory: 'MultiTermFacet',
    label: label || field,
    showInFacetsList: true,
    filterType,
    isFilterable,
    show: 10000,
    ...params,
  };
};

export const booleanFacet = (options) => {
  const { field, label, on, off, ...params } = isFunction(options)
    ? options()
    : options;

  return {
    ...defaults,
    field,
    label,
    on,
    off,
    factory: 'BooleanFacet',
    wrapper: 'DummySUIFacetWrapper',
    showInFacetsList: true,
    ...params,
  };
};

export const fixedRangeFacet = ({
  field,
  label,
  filterType = 'any',
  isFilterable = false,
  ...params
}) => {
  return {
    ...defaults,
    field,
    factory: 'FixedRangeFacet',
    label: label || field,
    showInFacetsList: true,
    filterType,
    isFilterable,
    ...params,
  };
};

export const dateRangeFacet = ({
  field,
  label,
  filterType = 'any',
  isFilterable = false,
  ...params
}) => {
  return {
    ...defaults,
    field,
    factory: 'DateRangeFacet',
    wrapper: 'DummySUIFacetWrapper',
    label: label || field,
    showInFacetsList: true,
    filterType,
    isFilterable,
    ...params,
  };
};
