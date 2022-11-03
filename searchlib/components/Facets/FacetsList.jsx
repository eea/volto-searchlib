import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { Component } from '@eeacms/search/components';

const FacetWrapperResolver = ({ info, defaultWrapper }) => {
  const { factory, wrapper } = info;
  // const facet = registry.resolve[factory];
  const FacetWrapperComponent = wrapper ? Component : defaultWrapper;
  const props = {
    ...info,
    ...info.params,
    // ...facet,
  };
  const { field } = info;
  const Facet = React.useCallback(
    (props) => <Component factoryName={factory} {...props} field={field} />,
    [factory, field],
  );
  return (
    <FacetWrapperComponent
      factoryName={wrapper}
      {...props}
      field={info.field}
      view={Facet}
    />
  );
};

const FacetsList = ({ view, defaultWrapper }) => {
  const { appConfig } = useAppConfig();
  const { facets = [] } = appConfig;
  const ViewComponent = view || Component;
  return (
    <ViewComponent name="DefaultFacetsList">
      {facets
        .filter((f) => f.showInFacetsList)
        .map((info, i) => (
          <FacetWrapperResolver
            info={info}
            key={i}
            defaultWrapper={defaultWrapper}
          />
        ))}
    </ViewComponent>
  );
};

export default FacetsList;
