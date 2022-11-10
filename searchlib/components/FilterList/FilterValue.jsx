import React from 'react';
import { valueToString } from '@eeacms/search/lib/utils';
import { Label, Icon as UiIcon } from 'semantic-ui-react';
import { Icon, Term } from '@eeacms/search/components';

const LABELS = {
  'any:exact': 'specific',
  'all:exact': 'all, specific',
  all: 'all',
  any: '',
};
const FilterValue = (props) => {
  const {
    value,
    values,
    field,
    type,
    appConfig,
    onClear,
    removeFilter,
  } = props;
  const facetConfig =
    appConfig.facets.find((facet) => facet.field === field) || {};
  const { iconsFamily } = facetConfig;
  const label = LABELS[type];

  return (
    <Label
      onClick={() => {
        return values.length === 1
          ? onClear(field)
          : removeFilter(field, value, type);
      }}
    >
      {iconsFamily && (
        <Icon family={iconsFamily} type={value} className="facet-option-icon" />
      )}
      <span className="text filterValue" title={value}>
        <Term term={valueToString(value)} field={field} />
        {label ? ` (${label})` : ''}
      </span>
      <UiIcon name="delete" />
    </Label>
  );
};

export default FilterValue;
