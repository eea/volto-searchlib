import React from 'react';
import { Segment, Accordion, Button, Icon } from 'semantic-ui-react';
import { useAppConfig, useSearchContext } from '@eeacms/search/lib/hocs';
import { isLandingPageAtom } from '@eeacms/search/state';
import { useAtom } from 'jotai';
import { FormattedMessage } from 'react-intl';

import ActiveFilterValue from './ActiveFilterValue';

const ActiveFilterList = (props) => {
  const { filters, clearFilters, setFilter, removeFilter } = useSearchContext();
  const [isOpened, setIsOpened] = React.useState(true);
  const [isLandingPage] = useAtom(isLandingPageAtom);
  const { appConfig, registry } = useAppConfig();

  const factoryName = appConfig.getActiveFilters;
  const activeFilters = registry.resolve[factoryName](filters, appConfig);

  return !isLandingPage && activeFilters.length ? (
    <Segment className="active-filter-list">
      <Accordion>
        <Accordion.Title
          tabIndex={0}
          active={isOpened}
          onClick={() => setIsOpened(!isOpened)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsOpened(!isOpened);
            }
          }}
        >
          <Icon className="ri-arrow-down-s-line" />
          <div className="filter-list-header">
            <h4 className="filter-list-title">
              {' '}
              <FormattedMessage
                id="Active filters"
                defaultMessage="Active filters"
              />
            </h4>
            <Button
              compact
              basic
              size="mini"
              className="clear-btn"
              onClick={() => clearFilters()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  clearFilters();
                }
              }}
            >
              <FormattedMessage id="clear all" defaultMessage="clear all" />
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
