import React from 'react';
import { Tab, Menu, List, Divider } from 'semantic-ui-react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useAtom } from 'jotai';

import { showFacetsAsideAtom } from '@eeacms/search/state';
import { getFacetCounts, getTotal } from './request';
import buildStateFacets from '@eeacms/search/lib/search/state/facets';
import { customOrder } from '@eeacms/search/lib/utils';
import { useLandingPageData, useLandingPageRequest } from './state';
import { Icon, Term } from '@eeacms/search/components';
import { withLanguage } from '@eeacms/search/lib/hocs';

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
  const { appConfig, setFilter, setSort } = props;
  const { appName } = appConfig;
  // const facetsConfig = appConfig.facets;

  const {
    sections = [],
    maxPerSection = 12,
    sortField,
    sortDirection,
    filterForAllResults,
  } = appConfig.initialView.tilesLandingPageParams;

  const sectionFacetFields = sections.map((s) => s.facetField);
  const [activeSection, setActiveSection] = React.useState(
    sections?.[0]?.facetField,
  );

  const [, setShowFacets] = useAtom(showFacetsAsideAtom);

  const [landingPageData, setLandingPageData] = useLandingPageData(appName);
  const [isRequested, setIsRequested] = useLandingPageRequest(appName);

  const activeSectionConfig = getFacetConfig(sections, activeSection);

  const getTiles = (maxPerSection_default) => {
    const maxPerSection =
      activeSectionConfig.maxPerSection || maxPerSection_default;
    let result = landingPageData?.facets?.[activeSection]?.[0]?.data || [];
    if (activeSectionConfig.blacklist !== undefined) {
      result = result.filter(
        (res) => !activeSectionConfig.blacklist.includes(res.value),
      );
    }
    if (activeSectionConfig.whitelist !== undefined) {
      result = result.filter((res) =>
        activeSectionConfig.whitelist.includes(res.value),
      );
    }

    // if (activeSection === 'language') {
    //   const fConfig = appConfig.facets.filter((f) => f.field === 'language');
    //   const languages = fConfig[0].facetValues;
    //   result = customOrder(result, languages);
    // }
    return [result.length > maxPerSection, result.slice(0, maxPerSection)];
  };

  const [hasOverflow, tiles] = getTiles(maxPerSection);

  const { icon } = activeSectionConfig;

  const total = landingPageData?.total;

  useDeepCompareEffect(() => {
    async function fetchFacets() {
      let facets;
      let total;
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
        total = await getTotal(appConfig);
      }

      if (!landingPageData && facets && total) {
        setLandingPageData({ facets, total });
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

  const fixedOnClickHandler = (conf) => {
    //TODO: This is a temporary solution, until we find another way to detect if there was any interaction on the landing page
    if (filterForAllResults) {
      setFilter(filterForAllResults.field, filterForAllResults.value);
    }
  };

  const { language } = props;
  const options = { language };

  const panes = sections.map((section, index) => {
    const tabIndex = index + 1;

    return {
      id: section,
      menuItem: {
        children: () => {
          return (
            <React.Fragment key={`tab-${tabIndex}`}>
              <Menu.Item
                tabIndex={0}
                active={activeSection === section.facetField}
                onClick={() => setActiveSection(section.facetField)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveSection(section.facetField);
                  }
                }}
              >
                {section.title}
              </Menu.Item>
            </React.Fragment>
          );
        },
      },
      render: () => {
        return (
          <>
            <Tab.Pane tabIndex={0}>
              <div className={`landing-page-cards ${activeSection}`}>
                <List>
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
                            const fdefault =
                              typeof facet.default === 'function'
                                ? facet.default(options)
                                : facet.default;
                            fdefault.values.forEach((value) =>
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
                        <List.Item
                          tabIndex={0}
                          onClick={onClickHandler}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onClickHandler();
                            }
                          }}
                          key={index}
                        >
                          <List.Content>
                            {icon ? <Icon {...icon} type={topic.value} /> : ''}
                            <Term term={topic.value} field={activeSection} />
                            <span className="count">
                              ({topic.count}{' '}
                              {topic.count === 1 ? 'item' : 'items'})
                            </span>
                          </List.Content>
                        </List.Item>
                      );
                    },
                  )}
                </List>
              </div>
            </Tab.Pane>
            <Divider />
            <div className="landing-page-cards">
              <List>
                <List.Item>
                  <List.Content>
                    <div
                      tabIndex={0}
                      key="all_data"
                      role="button"
                      onClick={fixedOnClickHandler}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fixedOnClickHandler();
                        }
                      }}
                    >
                      <div className="extra content">
                        <span className="count">
                          Show all {total} documents
                        </span>
                      </div>
                    </div>
                  </List.Content>
                </List.Item>
              </List>
            </div>
          </>
        );
      },
    };
  });

  return (
    <div className="landing-page-container">
      <div className="landing-page">
        <h4>Or search by</h4>
        <Tab
          className="search-tab"
          menu={{ secondary: true, pointing: true }}
          panes={panes}
        />
        {hasOverflow ? (
          <div className="tab-info">
            <p>Only first {maxPerSection} items are displayed.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default withLanguage(LandingPage);
