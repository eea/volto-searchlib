import React from 'react';
import { Button, Card } from 'semantic-ui-react'; // , Header, Divider
import { Icon, Term } from '@eeacms/search/components';

import { useSearchContext } from '@eeacms/search/lib/hocs';
import { useFilterState } from '@eeacms/search/state';

import { getFilterValueDisplay } from './utils';

const ActiveFilters = (props) => {
  const { onRemove, field } = props;

  const searchContext = useSearchContext();
  const { filters = [] } = searchContext;

  const initialValue =
    (filters.find((f) => f.field === field) || {})?.values || [];

  const [state, dispatch] = useFilterState(field, [
    !initialValue
      ? []
      : Array.isArray(initialValue)
      ? initialValue
      : [initialValue],
  ]);

  const [activeFilter, setActiveFilter] = React.useState(initialValue);

  return activeFilter.length > 0 ? (
    <>
      <div className="facet-list-header">
        <h5 className="modal-section-title">
          Active filters ({activeFilter.length})
        </h5>

        <Button
          basic
          className="clear-btn"
          content="clear all"
          onClick={() => {
            if (state.length > 0) {
              dispatch({
                type: 'reset',
                value: [],
                id: 'btn-clear-filters',
              });
            }
            setActiveFilter([]);
          }}
        />
      </div>

      <div className="facets-wrapper">
        {activeFilter.map((option, i) => {
          return (
            <Card
              key={`${getFilterValueDisplay(option)}`}
              className="term active-term"
            >
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
  ) : null;
};

export default ActiveFilters;
