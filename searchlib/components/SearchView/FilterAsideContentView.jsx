import React from 'react';
import { Sorting } from '@elastic/react-search-ui';
import { Grid } from 'semantic-ui-react';
import ResultsPerPageSelector from './../ResultsPerPageSelector/ResultsPerPageSelector';
import Paging from './../Paging/Paging';
import {
  // ViewSelectorWithLabel,
  SortingDropdownWithLabel,
  DownloadButton,
  DropdownFacetsList,
} from '@eeacms/search/components';
import { SectionTabs } from '@eeacms/search/components';
import { useViews } from '@eeacms/search/lib/hocs';

import registry from '@eeacms/search/registry';
import { AnswerBox, Component } from '@eeacms/search/components';
import { NoResults } from '@eeacms/search/components/Result/NoResults';
import { useSearchContext } from '@eeacms/search/lib/hocs';

export const FilterAsideContentView = (props) => {
  // console.log('redraw FilterAsideContentView');
  const { appConfig, children, current, wasInteracted } = props;
  const { sortOptions, resultViews } = appConfig;
  const views = useViews();
  const listingViewDef = resultViews.filter(
    (v) => v.id === views.activeViewId,
  )[0];
  const ResultViewComponent =
    registry.resolve[listingViewDef?.factories.view]?.component;

  // const availableResultViews = [
  //   ...resultViews.filter(({ id }) => {
  //     const paramsPropId = `${id}ViewParams`;
  //     return Object.keys(appConfig).includes(paramsPropId)
  //       ? appConfig[paramsPropId].enabled
  //       : true;
  //   }),
  // ];
  const searchContext = useSearchContext();
  const { contentSectionsParams = {} } = appConfig;

  React.useEffect(() => {
    const facetField = contentSectionsParams.sectionFacetsField;
    const { filters = [] } = searchContext;
    const activeFilter =
      filters.find(({ field }) => field === facetField) || {};
    let activeValues = activeFilter.values || [];
    const sectionMapping = Object.assign(
      {},
      ...contentSectionsParams.sections.map((s) => ({ [s.name]: s })),
    );

    if (activeValues.length > 0) {
      const defaultViewId =
        sectionMapping[activeValues?.[0]]?.defaultResultView || 'listing';
      views.setActiveViewId(defaultViewId);
    } else {
      views.reset();
    }
  }, [searchContext, contentSectionsParams, views]);

  const layoutMode =
    views.activeViewId === 'horizontalCard' ? 'fixed' : 'fullwidth';

  const { isLoading, wasSearched } = useSearchContext();

  return (
    <>
      <SectionTabs />

      <div className={`results-layout ${layoutMode}`}>
        <div className="above-results">
          <div className="above-left">
            <DropdownFacetsList />
          </div>
          <div className="above-right">
            <Component factoryName="SecondaryFacetsList" {...props} />
            <Sorting
              label={''}
              sortOptions={sortOptions}
              view={SortingDropdownWithLabel}
            />
            {/* <ViewSelectorWithLabel */}
            {/*   views={availableResultViews} */}
            {/*   active={activeViewId} */}
            {/*   onSetView={setActiveViewId} */}
            {/* /> */}
          </div>
        </div>

        {children.length === 0 && !isLoading && wasSearched && <NoResults />}

        {current === 1 ? <AnswerBox /> : ''}

        {<ResultViewComponent>{children}</ResultViewComponent>}

        {children.length > 0 && (
          <div className="search-body-footer">
            <Grid columns={2}>
              <Grid.Column>
                <ResultsPerPageSelector />
              </Grid.Column>
              <Grid.Column textAlign="right">
                <DownloadButton appConfig={appConfig} />
              </Grid.Column>
            </Grid>
            <Grid centered>
              <Grid.Column textAlign="center">
                <div className="prev-next-paging">
                  {!!wasInteracted && <Paging />}
                </div>
              </Grid.Column>
            </Grid>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterAsideContentView;
