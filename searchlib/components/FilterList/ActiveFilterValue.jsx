import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Term } from '@eeacms/search/components';
import { Label } from 'semantic-ui-react';

const ActiveFilterValue = (props) => {
  const { field, values, removeFilter } = props;
  const { appConfig } = useAppConfig();

  const filterConfig = appConfig.facets.find(
    (f) => (f.id || f.field) === field,
  );
  const facetField = field;
  const { label, activeFilterLabel } = appConfig.facets.find(
    ({ field }) => field === facetField,
  ) || { label: field?.trim() };

  return (
    <div className="filter-wrapper">
      <div className="filter-label">{activeFilterLabel || label}:</div>
      {values?.map((value, index) => {
        return (
          <Label
            key={index}
            className="filter-value"
            basic
            removeIcon="close"
            content={
              <span>
                {value?.type === 'range' ? (
                  <>
                    {value.from} - {value.to}
                  </>
                ) : (
                  <Term term={value} field={field} />
                )}
              </span>
            }
            onRemove={() => {
              removeFilter(field, value, filterConfig.filterType);
            }}
          />
        );
      })}
    </div>
  );
};

export default ActiveFilterValue;
