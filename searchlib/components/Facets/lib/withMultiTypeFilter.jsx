import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';

/**
 * A hoc that grants multi-type faceting (all/any)
 *
 * TODO: is this actually used?
 */

const messages = defineMessages({
  matchAny: {
    id: 'Match any',
    defaultMessage: 'Match any',
  },
  matchAll: {
    id: 'Match all',
    defaultMessage: 'Match all',
  },
});

const withMultiTypeFilter = (options = {}) => {
  const { defaultType = 'any' } = options;
  const intl = useIntl();

  const filterTypes = [
    { key: 2, text: intl.formatMessage(messages.matchAny), value: 'any' },
    { key: 1, text: intl.formatMessage(messages.matchAll), value: 'all' },
  ];

  const decorator = (WrappedComponent) => {
    function WithWrappedComponent(props) {
      const { appConfig } = useAppConfig();
      const { field = null, filters = {} } = props;
      const facet = appConfig.facets?.find((f) => f.field === field);
      const fallback = facet ? facet.filterType : defaultType;
      const defaultValue = field
        ? filters?.find((f) => f.field === field)?.type || fallback
        : fallback;
      const [filterType, setFilterType] = React.useState(defaultValue);
      return (
        <WrappedComponent
          {...props}
          filterType={filterType}
          selectedFilterType={filterType}
          availableFilterTypes={filterTypes}
          onChangeFilterType={(v) => {
            setFilterType(v);
          }}
        />
      );
    }

    return WithWrappedComponent;
  };

  return decorator;
};

export default withMultiTypeFilter;
