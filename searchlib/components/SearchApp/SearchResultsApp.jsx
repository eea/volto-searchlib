import React from 'react';
import { useViews, useSearchContext } from '@eeacms/search/lib/hocs';

import BasicSearchApp from './BasicSearchApp';

function BootstrapSearchResultsView(props) {
  const { appConfig, registry } = props;

  const searchContext = useSearchContext();
  const { results = [] } = searchContext;
  const { resultViews } = appConfig;
  const { activeViewId } = useViews();

  const itemViewProps = appConfig[`${activeViewId}ViewParams`];
  const listingViewDef = resultViews.filter((v) => v.id === activeViewId)[0];

  const Item = registry.resolve[listingViewDef?.factories?.item]?.component;

  const NoResultsComponent =
    appConfig.noResultsView?.factory &&
    registry.resolve[appConfig.noResultsView?.factory]?.component;

  const ContentBodyView =
    registry.resolve[appConfig['contentBodyComponent'] || 'DefaultContentView']
      .component;

  return NoResultsComponent ? (
    results.length ? (
      <ContentBodyView {...props}>
        {results.map((result, i) => (
          <Item key={`${i}-${result.id}`} result={result} {...itemViewProps} />
        ))}
      </ContentBodyView>
    ) : (
      <NoResultsComponent {...props} />
    )
  ) : results.length ? (
    <ContentBodyView {...props}>
      {results.map((result, i) => (
        <Item key={`${i}-${result.id}`} result={result} {...itemViewProps} />
      ))}
    </ContentBodyView>
  ) : (
    <div className="noResults"></div>
  );
}

export default function SearchResultsApp(props) {
  const { defaultFilters, defaultSort = '' } = props;
  const [sortField, sortDirection] = defaultSort.split('|');
  const [initialState] = React.useState({
    ...(defaultFilters?.length ? { filters: defaultFilters } : {}),
    ...(defaultSort ? { sortField, sortDirection } : {}),
  }); // this makes the prop stable

  return (
    <BasicSearchApp
      {...props}
      wasInteracted={true}
      searchViewComponent={BootstrapSearchResultsView}
      initialState={initialState}
    />
  );
}
