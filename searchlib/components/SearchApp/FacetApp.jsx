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
      driver._setState({ filters: [...filters, value].sort(sorter) });
    }
  }, [value, filters, field, setFilter, driver]); // searchContext

  React.useEffect(() => {
    if (!driver.events.plugins.find((plug) => plug.id === 'trackFilters')) {
      function subscribe(payload) {
        const { filters } = driver.state;
        const activeValue = filters.find((f) => f.field === field);
        if (!activeValue) {
          onChange(null);
        }
        if (!isEqual(activeValue, value)) {
          onChange(activeValue);
        }
      }
      driver.events.plugins.push({
        id: 'trackFilters',
        subscribe,
      });
    }
    return () => {
      driver.events.plugins = driver.events.plugins.filter(
        (plug) => plug.id !== 'trackFilters',
      );

      // handle deleting the facet
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
      onChangeFilterType={setLocalFilterType}
    />
  );
}

export default function FacetApp(props) {
  return <BasicSearchApp {...props} searchViewComponent={BoostrapFacetView} />;
}
