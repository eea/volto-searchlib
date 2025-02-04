import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { useIntl } from 'react-intl';

/**
 * A component that can autommatically look up its implementation from the
 * registry based on the provided component name
 */
const Component = ({ name, factoryName, ...rest }) => {
  // TODO: use name?
  const { registry } = useAppConfig();
  const Component = registry.resolve[factoryName]?.component;

  if (!Component) {
    // eslint-disable-next-line no-console
    console.warn(`Component not found in registry: ${factoryName}`);
    return null;
  }
  const intl = useIntl();
  rest.label =
    typeof rest.label === 'object'
      ? intl.formatMessage(rest.label)
      : rest.label;

  return <Component {...rest} />;
};

export default Component;
