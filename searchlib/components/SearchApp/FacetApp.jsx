/**
 * A Search app that wraps and provides access to a single facet
 *
 * Note, unlike BasicSearchApp, this is not a standalone search app,
 * it needs to be executed in the context of a search app
 */
import React from 'react';
// import { isEqual } from 'lodash';
// import useDeepCompareEffect from 'use-deep-compare-effect';

import { Facet as SUIFacet } from '@eeacms/search/components';
import { useSearchContext, useSearchDriver } from '@eeacms/search/lib/hocs'; // , useSearchDriver

// const sorter = (fa, fb) =>
//   fa.field === fb.field ? 0 : fa.field < fb.field ? -1 : 0;

export default function FacetApp(props) {
  const searchContext = useSearchContext();
  const { appConfig, registry, field, onChange, value } = props;
  // const { field, onChange, value } = props;
  const driver = useSearchDriver();
  // console.log({ searchContext, props, driver });
  const { filters, removeFilter, addFilter } = searchContext; // driver.state

  const facet = appConfig.facets?.find(
    (f) => f.field === field || f.id === field,
  );
  const FacetComponent = registry.resolve[facet.factory].component;

  const fallback = props.filterType || facet.filterType;
  const _defaultValue = field
    ? filters?.find((f) => f.field === field)?.type || fallback
    : fallback;
  const [defaultTypeValue] = (_defaultValue || '').split(':');
  const [localFilterType, setLocalFilterType] = React.useState(
    defaultTypeValue,
  );

  const onChangeFilterType = React.useCallback(
    (_type) => {
      removeFilter(field);
      const { values = [] } = value || {};
      values.forEach((v) => {
        addFilter(field, v, _type);
      });

      setLocalFilterType(_type);
    },
    [field, value, addFilter, removeFilter],
  );

  // useDeepCompareEffect(() => {
  //   // on initializing the form, set the active value as filters
  //   const activeFilter = filters?.find((filter) => filter.field === field);
  //   if (value && !activeFilter) {
  //     console.log('useDeep', activeFilter);
  //     const sortedFilters = [...filters, value].sort(sorter);
  //     driver._setState({ filters: sortedFilters });
  //   }
  // }, [value, filters, field, setFilter, driver]); // searchContext

  // const activeValue = filters.find((f) => f.field === field);

  // const dirty = !isEqual(activeValue, value);
  // console.log('redraw facet', { value, activeValue, dirty });

  const timerRef = React.useRef();

  // const sortedFilters = [...filters].sort(sorter);

  // useDeepCompareEffect(() => {
  //   timerRef.current && clearTimeout(timerRef.current);
  //   timerRef.current = setTimeout(() => {
  //     if (!isEqual(activeValue, value)) {
  //       console.log('onchange', { activeValue, value });
  //       onChange(activeValue);
  //     }
  //   }, 200);
  // }, [removeFilter, field, activeValue, value, onChange]);

  React.useEffect(
    () => () => {
      removeFilter(field); // when the Facet is removed, we remove the filter
      timerRef.current && clearTimeout(timerRef.current);
      // console.log('unmount', field);
    },
    [field, removeFilter],
  );

  React.useEffect(() => {
    value && addFilter(value.field, value.values, value.type);
  }, []);

  // React.useEffect(() => {
  //   const { plugins } = driver.events;
  //   const plugId = `trackFilters-${field}`;
  //
  //   if (!plugins.find((plug) => plug.id === plugId)) {
  //     function subscribe(payload) {
  //       const { filters } = driver.state;
  //       const activeValue = filters.find((f) => f.field === field);
  //       if (!activeValue) {
  //         onChange(null);
  //         return;
  //       }
  //       if (!isEqual(activeValue, value)) {
  //         onChange(activeValue);
  //       }
  //     }
  //     plugins.push({
  //       id: plugId,
  //       subscribe,
  //     });
  //   }
  //
  //   return () => {
  //     driver.events.plugins = driver.events.plugins.filter(
  //       (plug) => plug.id !== plugId,
  //     );
  //
  //     // handles deleting the facet
  //     driver._setState({
  //       filters: [
  //         ...driver.state.filters.filter((f) => f.field !== field),
  //       ].sort(sorter),
  //     });
  //   };
  // }, [driver, field, onChange, value]);

  return (
    <SUIFacet
      {...props}
      active={true}
      view={FacetComponent}
      filterType={localFilterType}
      onChangeFilterType={onChangeFilterType}
      onRemove={() => {
        const filter = driver.state.filters.find((f) => f.field === field);
        onChange(filter);
        // console.log('onRemove', JSON.stringify(driver.state.filters));
      }}
      onChange={() => {
        const filter = driver.state.filters.find((f) => f.field === field);
        onChange(filter);
        // console.log('onChange', JSON.stringify(driver.state.filters));
      }}
      onSelect={() => {
        const filter = driver.state.filters.find((f) => f.field === field);
        onChange(filter);
        // console.log('onSelect', JSON.stringify(driver.state.filters));
      }}
    />
  );
}
