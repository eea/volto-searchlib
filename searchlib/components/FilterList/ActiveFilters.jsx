import React from 'react';
import { Button, Card } from 'semantic-ui-react';
import { Icon, Term } from '@eeacms/search/components';
import { useSearchContext } from '@eeacms/search/lib/hocs';

const ActiveFilters = (props) => {
  const { onRemove, field } = props;

  const searchContext = useSearchContext();
  const { filters = [] } = searchContext;

  const initialValue =
    (filters.find((f) => f.field === field) || {})?.values || [];

  const [activeFilter, setActiveFilter] = React.useState(initialValue);

  return activeFilter.length > 0 ? (
    <div className="active-filters">
      {!activeFilter[0].type ? (
        <>
          <h5>Active filters:</h5>
          <div className="facets-wrapper">
            {activeFilter.map((option, i) => {
              return (
                <Card key={i} className="term active-term">
                  <Card.Content>
                    <Card.Header className="card-header">
                      <Term term={option} field={field} />
                      <Button
                        className="clear-filters"
                        size="mini"
                        onClick={() => {
                          let filteredValues = activeFilter.filter(
                            (v) => v !== option,
                          );
                          setActiveFilter(filteredValues);
                          onRemove(option);
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
          if (Array.isArray(activeFilter)) {
            (activeFilter || []).forEach((v) => {
              onRemove(v);
            });
          } else {
            onRemove([activeFilter || '']);
          }
        }}
      />
    </div>
  ) : null;
};

export default ActiveFilters;
