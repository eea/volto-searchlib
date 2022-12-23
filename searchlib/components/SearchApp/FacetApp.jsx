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

const sorter = (fa, fb) =>
  fa.field === fb.field ? 0 : fa.field < fb.field ? -1 : 0;

function BoostrapFacetView(props) {
  const { field, onChange, value } = props;
  const { appConfig, registry } = useAppConfig();
  const driver = useSearchDriver();
  // console.log(driver);
  const { filters, setFilter } = driver.state;

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

  useDeepCompareEffect(() => {
    // on initializing the form, set the active value as filters
    const activeFilter = filters?.find((filter) => filter.field === field);
    if (value && !activeFilter) {
      console.log('setting filter', {
        value,
        filters,
        activeFilter,
        field,
      });

      driver._setState({ filters: [...filters, value].sort(sorter) });
    }
  }, [value, filters, field, setFilter, driver]); // searchContext

  React.useEffect(() => {
    if (!driver.events.plugins.find((plug) => plug.id === 'trackFilters')) {
      function subscribe(payload) {
        console.log('track', payload);
      }
      driver.events.plugins.push({
        id: 'trackFilters',
        subscribe,
      });
    }
  }, [driver]);

  // useDeepCompareEffect()

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

// console.log('driver', driver);
// const searchContext = useSearchContext();
// console.log('searchContext', searchContext);
// const { filters } = searchContext;
// const filterAtom = filterFamily(field);
// const [savedFilters, setSavedFilters] = useAtom(filterAtom);
// const { appConfig, registry } = props;
