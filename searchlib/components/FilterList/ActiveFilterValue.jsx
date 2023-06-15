import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Term } from '@eeacms/search/components';
import { Label, Icon } from 'semantic-ui-react';

const ActiveFilterValue = (props) => {
  const { field, values, type, removeFilter } = props;
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
          <Label basic className="filter-value" key={index}>
            <span>
              {value?.type === 'range' ? (
                <>
                  {value.from} - {value.to}
                </>
              ) : (
                <Term term={value} field={field} />
              )}
              <span style={{ display: 'none' }}>{` (${type}) `}</span>
            </span>
            <Icon
              name="close"
              tabIndex={0}
              onClick={() => {
                if (values.length === 1) {
                  removeFilter(field, null, type || filterConfig.filterType);
                } else {
                  removeFilter(field, value, type || filterConfig.filterType);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (values.length === 1) {
                    removeFilter(field, null, type || filterConfig.filterType);
                  } else {
                    removeFilter(field, value, type || filterConfig.filterType);
                  }
                }
              }}
            />
          </Label>
        );
      })}
    </div>
  );
};

export default ActiveFilterValue;
