import React from 'react';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';
import { Term } from '@eeacms/search/components';
import { Label, Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const ActiveFilterValue = (props) => {
  const { field, values, type, removeFilter } = props;
  const { appConfig } = useAppConfig();
  const { clearFilters } = useSearchContext();

  const filterConfig = appConfig.facets.find(
    (f) => (f.id || f.field) === field,
  );
  const hideRemoveFilter = filterConfig?.hideRemoveFilter || false;
  const facetField = field;
  const { label, activeFilterLabel } = appConfig.facets.find(
    ({ field }) => field === facetField,
  ) || { label: field?.trim() };
  const filterLabel = activeFilterLabel || label;
  const objFilterLabel =
    typeof filterLabel === 'object' ? (
      <FormattedMessage {...filterLabel} />
    ) : (
      filterLabel
    );

  return (
    <div className="filter-wrapper">
      <div className="filter-label">{objFilterLabel}:</div>
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
            {!hideRemoveFilter && (
              <Icon
                name="close"
                tabIndex={0}
                onClick={() => {
                  if (!filterConfig.isMulti) {
                    clearFilters();
                  } else if (values.length === 1) {
                    removeFilter(field, null, type || filterConfig.filterType);
                  } else {
                    removeFilter(field, value, type || filterConfig.filterType);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (values.length === 1) {
                      removeFilter(
                        field,
                        null,
                        type || filterConfig.filterType,
                      );
                    } else {
                      removeFilter(
                        field,
                        value,
                        type || filterConfig.filterType,
                      );
                    }
                  }
                }}
              />
            )}
          </Label>
        );
      })}
    </div>
  );
};

export default ActiveFilterValue;
