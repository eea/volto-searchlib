import React from 'react';
import { Facet as SUIFacet } from '@eeacms/search/components';
import {
  useSearchContext,
  SearchContext,
  useProxiedSearchContext,
} from '@eeacms/search/lib/hocs';
import BasicSearchApp from './BasicSearchApp';

const timeoutRef = {};

function BoostrapFacetView(props) {
  const { field, onChange } = props;
  const { appConfig, registry } = props;
  const searchContext = useSearchContext();
  const {
    searchContext: facetSearchContext,
    // applySearch,
  } = useProxiedSearchContext(searchContext);
  const { filters } = facetSearchContext;

  const facet = appConfig.facets?.find((f) => f.field === field);

  const fallback = props.filterType ? props.filterType : facet.filterType;
  const defaultValue = field
    ? filters?.find((f) => f.field === field)?.type || fallback
    : fallback;

  const [defaultTypeValue] = (defaultValue || '').split(':');

  const [localFilterType, setLocalFilterType] = React.useState(
    defaultTypeValue,
  );
  const FacetComponent = registry.resolve[facet.factory].component;

  React.useEffect(() => {
    const { current } = timeoutRef;
    if (current) {
      clearTimeout(current);
    } else {
      timeoutRef.current = setTimeout(() => onChange(filters), 400);
    }

    return () => {
      if (current) clearTimeout(current);
    };
  }, [filters, onChange]);

  return (
    <SearchContext.Provider value={facetSearchContext}>
      <SUIFacet
        {...props}
        active={true}
        filterType={localFilterType}
        onChangeFilterType={setLocalFilterType}
        view={FacetComponent}
      />
    </SearchContext.Provider>
  );
}

export default function FacetApp(props) {
  return <BasicSearchApp {...props} searchViewComponent={BoostrapFacetView} />;
}

// console.log('props', props);
// const rawSearchContext = useSearchContext();
// const {
//   searchContext: facetSearchContext,
//   applySearch,
// } = useProxiedSearchContext(rawSearchContext);
// const { appConfig } = useAppConfig();
// console.log('facet', facet);
// import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';
// import useDeepCompareEffect from 'use-deep-compare-effect';
// console.log('outside');
// console.log('triggered change on filters');

// useWhyDidYouUpdate('Bootstrap', { filters, onChange });
// React.useEffect(
//   () => () => {
//     console.log('unmount BootstrapFacetView');
//   },
//   [],
// );
