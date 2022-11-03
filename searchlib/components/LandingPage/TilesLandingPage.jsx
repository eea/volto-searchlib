import React from 'react';
import { Card, Tab, Menu } from 'semantic-ui-react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useAtom } from 'jotai';

import { showFacetsAsideAtom } from '@eeacms/search/state';
import { getFacetCounts } from './request';
import buildStateFacets from '@eeacms/search/lib/search/state/facets';
import { customOrder } from '@eeacms/search/lib/utils';
import { landingPageDataAtom, isRequestedAtom } from './state';
import { Icon, Term } from '@eeacms/search/components';

const getFacetConfig = (sections, name) => {
  return sections?.find((facet) => facet.facetField === name);
};

const cmp = (a, b, sortOrder) => {
  const modifier = sortOrder === 'desc' ? -1 : 1;
  return a > b ? modifier * 1 : a === b ? 0 : modifier * -1;
};

const sortedTiles = (tiles, sectionConfig, appConfig) => {
  if (sectionConfig.sortOn === 'custom') {
    const fConfig = appConfig.facets.filter(
      (f) => f.field === sectionConfig.facetField,
    );
    const facetValues = fConfig[0].facetValues;
    return customOrder(tiles, facetValues);
  } else {
    return tiles.sort((a, b) =>
      sectionConfig.sortOn === 'alpha'
        ? cmp(a.value, b.value, sectionConfig.sortOrder || 'asc')
        : cmp(a.count, b.count, sectionConfig.sortOrder || 'asc'),
    );
  }
};

const LandingPage = (props) => {
  const { appConfig, children, setFilter, setSort } = props;
  // const facetsConfig = appConfig.facets;

  const {
    sections = [],
    maxPerSection = 12,
    sortField,
    sortDirection,
  } = appConfig.initialView.tilesLandingPageParams;

  const sectionFacetFields = sections.map((s) => s.facetField);
  const [activeSection, setActiveSection] = React.useState(
    sections?.[0]?.facetField,
  );

  const [, setShowFacets] = useAtom(showFacetsAsideAtom);

  const [landingPageData, setLandingPageData] = useAtom(landingPageDataAtom);
  const [isRequested, setIsRequested] = useAtom(isRequestedAtom);

  const getTiles = (maxPerSection) => {
    let result = landingPageData?.[activeSection]?.[0]?.data || [];

    // if (activeSection === 'language') {
    //   const fConfig = appConfig.facets.filter((f) => f.field === 'language');
    //   const languages = fConfig[0].facetValues;
    //   result = customOrder(result, languages);
    // }
    return [result.length > maxPerSection, result.slice(0, maxPerSection)];
  };

  const [hasOverflow, tiles] = getTiles(maxPerSection);

  const activeSectionConfig = getFacetConfig(sections, activeSection);
  const { icon } = activeSectionConfig;

  useDeepCompareEffect(() => {
    async function fetchFacets() {
      let facets;
      if (!isRequested) {
        setIsRequested(true);
      } else {
        return;
      }

      if (!landingPageData) {
        const state = {
          filters: sections
            ?.filter((f) => f.filterType === 'any:exact')
            .map(({ facetField, filterType = 'any' }) => ({
              field: facetField,
              values: [],
              type: filterType,
            })),
        };
        // console.log('state', state);
        const facetCounts = await getFacetCounts(
          state,
          appConfig,
          sectionFacetFields,
        );
        facets = buildStateFacets(facetCounts, appConfig);
      }

      if (!landingPageData && facets) {
        setLandingPageData(facets);
      }
    }
    if (!landingPageData) {
      fetchFacets();
    }
  }, [
    isRequested,
    setIsRequested,
    appConfig,
    sectionFacetFields,
    landingPageData,
    setLandingPageData,
    sections,
  ]);

  const panes = sections.map((section, index) => {
    const tabIndex = index + 1;

    return {
      id: section,
      menuItem: {
        children: () => {
          return (
            <React.Fragment key={`tab-${tabIndex}`}>
              <Menu.Item
                active={activeSection === section.facetField}
                onClick={() => setActiveSection(section.facetField)}
              >
                {section.title}
              </Menu.Item>
            </React.Fragment>
          );
        },
      },
      render: () => {
        return (
          <Tab.Pane>
            <div className="landing-page-cards">
              <Card.Group itemsPerRow={5}>
                {sortedTiles(tiles, activeSectionConfig, appConfig).map(
                  (topic, index) => {
                    const onClickHandler = () => {
                      setFilter(
                        activeSection,
                        topic.value,
                        activeSectionConfig.filterType || 'any',
                      );

                      // apply configured default values
                      appConfig.facets
                        .filter((f) => f.field !== activeSection && f.default)
                        .forEach((facet) => {
                          facet.default.values.forEach((value) =>
                            setFilter(
                              facet.field,
                              value,
                              facet.default.type || 'any',
                            ),
                          );
                        });
                      setSort(sortField, sortDirection);
                      setShowFacets(true);
                    };

                    return (
                      <Card onClick={onClickHandler} key={index}>
                        <Card.Content>
                          <Card.Header>
                            {icon ? <Icon {...icon} type={topic.value} /> : ''}
                            <Term term={topic.value} field={activeSection} />
                          </Card.Header>
                        </Card.Content>
                        <Card.Content extra>
                          <span className="count">
                            {topic.count} {topic.count === 1 ? 'item' : 'items'}
                          </span>
                        </Card.Content>
                      </Card>
                    );
                  },
                )}
              </Card.Group>
            </div>
          </Tab.Pane>
        );
      },
    };
  });

  return (
    <div className="landing-page-container">
      <div className="landing-page">
        <h4>Or search by</h4>
        <div className="search-tab-wrapper">
          <Tab
            className="search-tab"
            menu={{ secondary: true, pointing: true }}
            panes={panes}
          />
        </div>
        {hasOverflow ? (
          <div className="tab-info">
            <p>Only first {maxPerSection} items are displayed.</p>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};

export default LandingPage;
