/**
 * A Search app that wraps and provides access to a single facet
 */
import React from 'react';
import { Facet as SUIFacet } from '@eeacms/search/components';
import { useAppConfig, useSearchDriver } from '@eeacms/search/lib/hocs';
import BasicSearchApp from './BasicSearchApp';
import { isEqual } from 'lodash';
import useDeepCompareEffect from 'use-deep-compare-effect';

const sorter = (fa, fb) =>
  fa.field === fb.field ? 0 : fa.field < fb.field ? -1 : 0;

function BoostrapFacetView(props) {
  const { field, onChange, value } = props;
  const { appConfig, registry } = useAppConfig();
  const driver = useSearchDriver();
  const { filters, setFilter } = driver.state;

  const facet = appConfig.facets?.find((f) => f.field === field);
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
      driver.removeFilter(field);
      const { values = [] } = value || {};
      values.forEach((v) => {
        driver.addFilter(field, v, _type);
      });

      setLocalFilterType(_type);
    },
    [driver, field, value],
  );

  useDeepCompareEffect(() => {
    // on initializing the form, set the active value as filters
    const activeFilter = filters?.find((filter) => filter.field === field);
    if (value && !activeFilter) {
      const sortedFilters = [...filters, value].sort(sorter);
      driver._setState({ filters: sortedFilters });
    }
  }, [value, filters, field, setFilter, driver]); // searchContext

  React.useEffect(() => {
    const { plugins } = driver.events;
    const plugId = `trackFilters-${field}`;

    if (!plugins.find((plug) => plug.id === plugId)) {
      function subscribe(payload) {
        const { filters } = driver.state;
        const activeValue = filters.find((f) => f.field === field);
        if (!activeValue) {
          onChange(null);
          return;
        }
        if (!isEqual(activeValue, value)) {
          onChange(activeValue);
        }
      }
      plugins.push({
        id: plugId,
        subscribe,
      });
    }

    return () => {
      driver.events.plugins = driver.events.plugins.filter(
        (plug) => plug.id !== plugId,
      );

      // handles deleting the facet
      driver._setState({
        filters: [
          ...driver.state.filters.filter((f) => f.field !== field),
        ].sort(sorter),
      });
    };
  }, [driver, field, onChange, value]);

  return (
    <SUIFacet
      {...props}
      active={true}
      view={FacetComponent}
      filterType={localFilterType}
      onChangeFilterType={onChangeFilterType}
    />
  );
}

export default function FacetApp(props) {
  return <BasicSearchApp {...props} searchViewComponent={BoostrapFacetView} />;
}
