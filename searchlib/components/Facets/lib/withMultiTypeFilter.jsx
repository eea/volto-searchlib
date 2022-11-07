import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs';

/**
 * A hoc that grants multi-type faceting (all/any)
 *
 * TODO: is this actually used?
 */

const withMultiTypeFilter = (options = {}) => {
  const { defaultType = 'any' } = options;

  const filterTypes = [
    { key: 2, text: 'Match any', value: 'any' },
    { key: 1, text: 'Match all', value: 'all' },
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
