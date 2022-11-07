import React from 'react';
import registry from '@eeacms/search/registry';
import { useViews, useSearchContext } from '@eeacms/search/lib/hocs';

export const BodyContent = (props) => {
  const { appConfig, wasInteracted } = props;
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

  const InitialViewComponent =
    appConfig.initialView?.factory &&
    registry.resolve[appConfig.initialView.factory].component;

  return wasInteracted ? (
    NoResultsComponent ? (
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
    ) : (
      <ContentBodyView {...props}>
        {results.map((result, i) => (
          <Item key={`${i}-${result.id}`} result={result} {...itemViewProps} />
        ))}
      </ContentBodyView>
    )
  ) : InitialViewComponent ? (
    <InitialViewComponent {...props} />
  ) : (
    <ContentBodyView {...props}>
      {results.map((result, i) => {
        return (
          <Item key={`${i}-${result.id}`} result={result} {...itemViewProps} />
        );
      })}
    </ContentBodyView>
  );
};
