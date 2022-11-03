import React from 'react';
import { Component } from '@eeacms/search/components';
import { useAppConfig } from '@eeacms/search/lib/hocs';

export default function FacetResolver(props) {
  const { factory, wrapper, field, ...rest } = props;
  const { registry } = useAppConfig();

  const facetConfig = registry.resolve[factory];

  const FacetComponent = facetConfig.component;

  return (
    <Component
      {...rest}
      factoryName={wrapper}
      view={FacetComponent}
      field={field}
    />
  );
}
