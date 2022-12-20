import React from 'react';
import { Facet as SUIFacet } from '@eeacms/search/components';
import {
  useSearchContext,
  SearchContext,
  useProxiedSearchContext,
} from '@eeacms/search/lib/hocs';
import BasicSearchApp from './BasicSearchApp';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { isEqual } from 'lodash';

const filterFamily = atomFamily(
  ({ field }) => atom(),
  (a, b) => a.field === b.field,
);

function BoostrapFacetView(props) {
  const { field, onChange, value } = props;
  console.log('value', value);
  const { appConfig, registry } = props;
  const {
    searchContext: facetSearchContext,
    applySearch,
  } = useProxiedSearchContext(useSearchContext());
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

  const filterAtom = filterFamily(field);
  const [savedFilters, setSavedFilters] = useAtom(filterAtom);

  React.useEffect(() => {
    if (!isEqual(filters, savedFilters)) {
      facetSearchContext.clearFilters();
      console.log('value', value);
      if (value)
        facetSearchContext.setFilter(value.field, value.type, value.values);
      setSavedFilters(filters);
      onChange(filters);
    }
  }, [
    field,
    filters,
    onChange,
    savedFilters,
    setSavedFilters,
    value,
    facetSearchContext,
  ]);

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
