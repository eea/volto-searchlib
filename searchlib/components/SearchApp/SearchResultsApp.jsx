import React from 'react';
import { useViews, useSearchContext } from '@eeacms/search/lib/hocs';

import BasicSearchApp from './BasicSearchApp';
// import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

function BootstrapSearchResultsView(props) {
  const { appConfig, registry, children } = props;

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

  React.useEffect(
    () => () => console.log('unmount BootstrapSearchResultsView'),
    [],
  );

  return (
    <>
      {children}
      {NoResultsComponent ? (
        results.length ? (
          <ContentBodyView {...props}>
            {results.map((result, i) => (
              <Item
                key={`${i}-${result.id}`}
                result={result}
                {...itemViewProps}
              />
            ))}
          </ContentBodyView>
        ) : (
          <NoResultsComponent {...props} />
        )
      ) : results.length ? (
        <ContentBodyView {...props}>
          {results.map((result, i) => (
            <Item
              key={`${i}-${result.id}`}
              result={result}
              {...itemViewProps}
            />
          ))}
        </ContentBodyView>
      ) : (
        <div className="noResults"></div>
      )}
    </>
  );
}

export default function SearchResultsApp(props) {
  const { defaultFilters, defaultSort = '' } = props;
  const [sortField, sortDirection] = defaultSort.split('|');
  const [initialState] = React.useState({
    ...(defaultFilters?.length
      ? {
          filters: defaultFilters

            ?.map((f) => (f.value ? f.value : undefined))
            .filter((f) => !!f),
        }
      : {}),
    ...(defaultSort ? { sortField, sortDirection } : {}),
  }); // this makes the prop stable
  const { registry } = props;

  // React.useEffect(() => {
  //   return () => console.log('unmount SearchResultsApp');
  // }, []);
  // const ref = React.useRef();
  // React.useEffect(() => {
  //   ref.current = registry;
  // });
  //
  // if (!(registry === ref.current))
  //   console.log('SearchResultsApp isSame', ref.current, registry);
  // useWhyDidYouUpdate('SearchResultsApp', { registry });
  // console.log('redraw SearchResultsApp');

  return (
    <BasicSearchApp
      {...props}
      registry={registry}
      wasInteracted={true}
      searchViewComponent={BootstrapSearchResultsView}
      initialState={initialState}
    />
  );
}
