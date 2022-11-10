import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Component } from '@eeacms/search/components';
import { Label } from 'semantic-ui-react';

const Filter = (props) => {
  const {
    field,
    type,
    values,
    onClear,
    removeFilter,
    noTitle,
    customClass,
  } = props;
  const { appConfig, registry } = useAppConfig();
  const facetField = field;
  const { label } = appConfig.facets.find(
    ({ field }) => field === facetField,
  ) || { label: field?.trim() };

  return (
    <div className={`filter-list-item ${customClass ? customClass : ''}`}>
      <div className="filter-name">
        {!noTitle ? `${label}${type !== 'none' ? ` (${type})` : ''}:` : null}
      </div>
      <Label.Group>
        {values?.map((v, index) => {
          const filterValueFactoryName =
            appConfig.facets.find((facet) => facet.field === field)
              .filterListComponent || 'DefaultFilterValue';
          return (
            <Component
              key={index}
              factoryName={filterValueFactoryName}
              value={v}
              values={values}
              field={field}
              type={type}
              appConfig={appConfig}
              registry={registry}
              onClear={onClear}
              removeFilter={removeFilter}
            />
          );
        })}
      </Label.Group>
    </div>
  );
};

export default Filter;
