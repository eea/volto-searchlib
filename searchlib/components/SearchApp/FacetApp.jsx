import React from 'react';
import ReactDOM from 'react-dom';
import { Facet as SUIFacet } from '@eeacms/search/components';
import {
  useSearchContext,
  useAppConfig,
  useSearchDriver,
} from '@eeacms/search/lib/hocs';
import BasicSearchApp from './BasicSearchApp';
import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { isEqual } from 'lodash';
import useDeepCompareEffect from 'use-deep-compare-effect';

const filterFamily = atomFamily(
  ({ field }) => atom(),
  (a, b) => a.field === b.field,
);

function BoostrapFacetView(props) {
  const { field, onChange, value } = props;
  // const { appConfig, registry } = props;
  const { appConfig, registry } = useAppConfig();
  const searchContext = useSearchContext();
  // console.log('searchContext', searchContext);

  const { filters } = searchContext;

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
  // const driver = useSearchDriver();
  // console.log('driver', driver);

  // useDeepCompareEffect(() => {
  //   const activeFilter = filters?.find((filter) => filter.field === field);
  //   if (value && !activeFilter) {
  //     console.log('setting filter', {
  //       value,
  //       filters,
  //       activeFilter,
  //       field,
  //       searchContext,
  //     });
  //
  //     ReactDOM.unstable_batchedUpdates(() =>
  //       value.values.forEach((v) =>
  //         searchContext.setFilter(value.field, v, value.type),
  //       ),
  //     );
  //   }
  // }, [value, filters, field, searchContext]);

  // React.useEffect(() => {
  //   if (!isEqual(filters, savedFilters)) {
  //     setSavedFilters(filters);
  //     const newValue = filters?.find((filter) => filter.field === field);
  //
  //     if (newValue && !isEqual(value, newValue)) {
  //       // console.log('onchange useeffect', {
  //       //   value,
  //       //   newValue,
  //       //   filters,
  //       //   savedFilters,
  //       // });
  //       onChange(newValue);
  //       // facetSearchContext.setFilter(value.field, value.values, value.type);
  //       // facetSearchContext.applySearch();
  //     } else {
  //       searchContext.removeFilter(field);
  //     }
  //   }
  // }, [
  //   field,
  //   filters,
  //   onChange,
  //   savedFilters,
  //   setSavedFilters,
  //   value,
  //   searchContext,
  // ]);

  return (
    <SUIFacet
      {...props}
      active={true}
      view={FacetComponent}
      filterType={localFilterType}
      onChangeFilterType={setLocalFilterType}
    />
  );
}

export default function FacetApp(props) {
  return <BasicSearchApp {...props} searchViewComponent={BoostrapFacetView} />;
}

// const {
//   searchContext: facetSearchContext,
//   applySearch,
// } = useProxiedSearchContext(useSearchContext(), `${field}`);
// console.log('current applied filters', value, filters);
// useProxiedSearchContext,
