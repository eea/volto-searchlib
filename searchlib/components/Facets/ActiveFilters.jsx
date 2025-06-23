// This component is used by the dropdown facets to show the selected active filters for that facet

import React from 'react';
import { Button, Card } from 'semantic-ui-react';
import { Icon, Term } from '@eeacms/search/components';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';
import { FormattedMessage } from 'react-intl';

const ActiveFilters = (props) => {
  const { onRemove, field } = props;
  const { appConfig } = useAppConfig();
  const { clearFilters } = useSearchContext();

  const filterConfig = appConfig.facets.find(
    (f) => (f.id || f.field) === field,
  );
  const searchContext = useSearchContext();
  const { filters = [] } = searchContext;

  const initialValue =
    (filters.find((f) => f.field === field) || {})?.values || [];

  const activeFilter = initialValue;
  // const [activeFilter, setActiveFilter] = React.useState(initialValue);

  return activeFilter.length > 0 ? (
    <div className="active-filters">
      {!activeFilter[0].type ? (
        <>
          <h5>
            <FormattedMessage
              id="Active filters:"
              defaultMessage="Active filters:"
            />
          </h5>
          <div className="facets-wrapper">
            {activeFilter.map((option, i) => {
              return (
                <Card key={i} className="term active-term">
                  <Card.Content>
                    <Card.Header className="card-header">
                      <Term term={option} field={field} />
                      <Button
                        className="clear-filters"
                        onClick={() => {
                          // let filteredValues = activeFilter.filter(
                          //   (v) => v !== option,
                          // );
                          // // setActiveFilter(filteredValues);
                          if (!filterConfig.isMulti) {
                            clearFilters();
                          } else {
                            onRemove(option);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (!filterConfig.isMulti) {
                              clearFilters();
                            } else {
                              onRemove(option);
                            }
                          }
                        }}
                      >
                        <Icon name="close" role="button" />
                      </Button>
                    </Card.Header>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        </>
      ) : null}

      <Button
        size="mini"
        className="clear-btn"
        content="Clear all"
        onClick={() => {
          if (!filterConfig.isMulti) {
            clearFilters();
          } else if (Array.isArray(activeFilter)) {
            (activeFilter || []).forEach((v) => {
              onRemove(v);
            });
          } else {
            onRemove([activeFilter || '']);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (!filterConfig.isMulti) {
              clearFilters();
            } else if (Array.isArray(activeFilter)) {
              (activeFilter || []).forEach((v) => {
                onRemove(v);
              });
            } else {
              onRemove([activeFilter || '']);
            }
          }
        }}
      />
    </div>
  ) : null;
};

export default ActiveFilters;
