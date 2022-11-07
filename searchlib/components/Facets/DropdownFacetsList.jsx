import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import {
  useSearchContext,
  useProxiedSearchContext,
  // SearchContext,
} from '@eeacms/search/lib/hocs';
import { Button } from 'semantic-ui-react';
import { isFilterValueDefaultValue } from '@eeacms/search/lib/search/helpers';

import FacetResolver from './FacetResolver';
import SidebarFacetsList from './SidebarFacetsList';
import { sidebarState, liveSearchState } from './state';
import { useAtom } from 'jotai';

const DropdownFacetsList = ({ defaultWrapper }) => {
  // console.log('redraw dropdownfacetslist');

  const { appConfig } = useAppConfig();
  const rawSearchContext = useSearchContext();
  const { filters } = rawSearchContext; // clearFilters
  const {
    // searchContext: sidebarSearchContext,
    applySearch,
  } = useProxiedSearchContext(rawSearchContext);
  const { facets = [] } = appConfig;

  const [showSidebar, setShowSidebar] = useAtom(sidebarState);

  const filterableFacets = facets.filter(
    (f) => !f.isFilter && f.showInFacetsList,
  );
  const facetNames = filterableFacets.map((f) => f.field);

  const filterNames = filters
    .filter((f) => facetNames.includes(f.field))
    .map((f) => f.field);

  const alwaysVisibleFacets = filterableFacets.filter((f) => f.alwaysVisible);
  const alwaysVisibleFacetNames = alwaysVisibleFacets.map((f) => f.field);

  const filtersByKey = filters.reduce(
    (acc, cur) => ({ ...acc, [cur.field]: cur }),
    {},
  );

  const activeFacets = filterableFacets.filter(
    (f) =>
      filterNames.includes(f.field) &&
      !alwaysVisibleFacetNames.includes(f.field) &&
      !isFilterValueDefaultValue(filtersByKey[f.field], appConfig),
  );

  const dropdownFacets = [...alwaysVisibleFacets, ...activeFacets];

  const sidebarFacets = filterableFacets.filter(
    (f) => !alwaysVisibleFacetNames.includes(f.field),
  );

  // const dropdownFacetFields = dropdownFacets.map((f) => f.field);
  // const sidebarFacets = filterableFacets.filter(
  //   (f) => !dropdownFacetFields.includes(f.field),
  // );

  const [isLiveSearch, setIsLiveSearch] = useAtom(liveSearchState);

  return (
    <div className="dropdown-facets-list">
      <div className="horizontal-dropdown-facets">
        {dropdownFacets.map((facetInfo, i) => (
          <FacetResolver
            key={i}
            {...facetInfo}
            {...rawSearchContext}
            applySearch={applySearch}
            wrapper="DropdownFacetWrapper"
          />
        ))}
        <div className="dropdown-facet">
          <span className="facet-title">
            <Button
              className="sui-button basic"
              onClick={() => setShowSidebar(true)}
              // disabled={isLiveSearch}
            >
              + More filters
            </Button>
          </span>
        </div>
        {/*
        {filterNames.length > 0 && (
          <Button
            basic
            className="clear-btn"
            content="Clear all filters"
            onClick={() => {
              // rawSearchContext.resetFilters();
              const exclude = facets
                .filter((f) => f.isFilter)
                .map((f) => f.field);
              clearFilters(exclude);
            }}
          />
        )} */}
      </div>
      <SidebarFacetsList
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        facets={sidebarFacets}
        isLiveSearch={isLiveSearch}
        setIsLiveSearch={setIsLiveSearch}
      />
      {/* {!isLiveSearch ? (
        <SearchContext.Provider value={sidebarSearchContext}>
          <SidebarFacetsList
            open={showSidebar}
            onClose={() => setShowSidebar(false)}
            facets={sidebarFacets}
            applySearch={applySearch}
            isLiveSearch={isLiveSearch}
            setIsLiveSearch={setIsLiveSearch}
          />
        </SearchContext.Provider>
      ) : (
        <SidebarFacetsList
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          facets={sidebarFacets}
          isLiveSearch={isLiveSearch}
          setIsLiveSearch={setIsLiveSearch}
        />
      )} */}
    </div>
  );
};

export default DropdownFacetsList;
