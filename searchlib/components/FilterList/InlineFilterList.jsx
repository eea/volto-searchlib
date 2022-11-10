import React from 'react';
import Filter from './Filter';
import { Divider, Segment, Accordion, Button, Icon } from 'semantic-ui-react';
import { useSearchContext, useAppConfig } from '@eeacms/search/lib/hocs';
import { useAtom } from 'jotai';
import { showFacetsAsideAtom } from '@eeacms/search/state';
import { isLandingPageAtom } from './../SearchView/state';

const InlineFilterList = (props) => {
  const { filters, clearFilters, setFilter, removeFilter } = useSearchContext();

  const [isOpened, setIsOpened] = React.useState(false);
  const [showFacets, setShowFacets] = useAtom(showFacetsAsideAtom);
  const [isLandingPage] = useAtom(isLandingPageAtom);
  const { appConfig } = useAppConfig();
  const { facets } = appConfig;
  const hideFilters = true; // TODO Show/Hide filters + Reset + Sort + Display - in the same component

  return !isLandingPage ? (
    <div className="inline-filter-list">
      <Button
        className="show-filters"
        toggle
        active={showFacets}
        onClick={() => {
          setShowFacets(!showFacets);
        }}
      >
        <Icon name="filter" />
        {showFacets ? 'Hide filters' : 'Show more filters'}
      </Button>

      {filters.length && !hideFilters ? (
        <Segment inverted className="filter-list">
          <Accordion inverted>
            <Accordion.Title
              className="filter-list-header"
              active={isOpened}
              onClick={() => setIsOpened(!isOpened)}
            >
              <div>
                <Icon name="dropdown" />
                Current filters applied: {filters.length}
              </div>
              <Button
                className="reset-filters"
                compact
                basic
                inverted
                size="mini"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  clearFilters();

                  facets.forEach((facet) => {
                    if (facet.default) {
                      setFilter(
                        facet.field,
                        facet.default.values,
                        facet.default.type || 'any',
                      );
                    }
                  });

                  // Object.keys(defaultFilterValues).map((filter, index) => {
                  //   setFilter(
                  //     filter,
                  //     defaultFilterValues[filter]?.value,
                  //     defaultFilterValues[filter]?.type,
                  //   );
                  //   return true;
                  // });
                }}
              >
                Reset
                <Icon name="undo alternate" />
              </Button>
            </Accordion.Title>
            <Accordion.Content
              className="filter-list-content"
              active={isOpened}
            >
              <Divider inverted />
              <div className="filter">
                {filters.map((filter, index) => {
                  return (
                    <Filter
                      key={index}
                      {...filter}
                      setFilter={setFilter}
                      removeFilter={removeFilter}
                      onClear={(field) => {
                        const activeFilters = filters.map(({ field }) => field);
                        const exclude = activeFilters.filter(
                          (name) => name !== field,
                        );
                        clearFilters(exclude);
                      }}
                    />
                  );
                })}
                <div className="filter-list-footer"></div>
              </div>
            </Accordion.Content>
          </Accordion>
        </Segment>
      ) : null}
    </div>
  ) : null;
};

export default InlineFilterList;
