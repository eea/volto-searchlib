import React from 'react';
import { Segment, Accordion, Button, Icon } from 'semantic-ui-react';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { isLandingPageAtom } from '@eeacms/search/state';
import { useAtom } from 'jotai';

import ActiveFilterValue from './ActiveFilterValue';

const ActiveFilterList = (props) => {
  const { filters, clearFilters, setFilter, removeFilter } = useSearchContext();
  const [isOpened, setIsOpened] = React.useState(true);
  const [isLandingPage] = useAtom(isLandingPageAtom);
  const { appConfig } = useAppConfig();
  const { facets = [] } = appConfig;
  const filterableFacets = facets.filter(
    (f) => !f.isFilter && f.showInFacetsList,
  );
  const facetNames = filterableFacets.map((f) => f.field);

  const filterNames = filters
    .filter((f) => facetNames.includes(f.field))
    .map((f) => f.field);

  const activeFilters = filters.filter((f) => filterNames.includes(f.field));

  return !isLandingPage && activeFilters.length ? (
    <Segment className="active-filter-list">
      <Accordion>
        <Accordion.Title
          active={isOpened}
          onClick={() => setIsOpened(!isOpened)}
        >
          <Icon className="ri-arrow-down-s-line" />
          <div className="filter-list-header">
            <h4 className="filter-list-title">Active filters</h4>
            <Button
              compact
              basic
              size="mini"
              className="clear-btn"
              onClick={() => clearFilters()}
            >
              clear all
            </Button>
          </div>
        </Accordion.Title>
        <Accordion.Content className="filter-list-content" active={isOpened}>
          <div className="filter">
            {activeFilters.map((filter, index) => {
              return (
                <ActiveFilterValue
                  key={index}
                  {...filter}
                  setFilter={setFilter}
                  removeFilter={removeFilter}
                />
              );
            })}
          </div>
        </Accordion.Content>
      </Accordion>
    </Segment>
  ) : null;
};

export default ActiveFilterList;
