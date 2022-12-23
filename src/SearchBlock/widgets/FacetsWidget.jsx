import React from 'react';
import { ObjectListWidget } from '@plone/volto/components';
import { isEqual } from 'lodash';
import { useSearchDriver } from '@eeacms/search/lib/hocs';
import useDeepCompareEffect from 'use-deep-compare-effect';

const sorter = (fa, fb) =>
  fa.field === fb.field ? 0 : fa.field < fb.field ? -1 : 0;

export default function FacetsWidget(props) {
  const { value } = props; // , onChange, id
  const driver = useSearchDriver();
  let filters, sortedFilters, sortedFilterValue;

  if (driver) {
    filters = driver.state.filters;
    sortedFilters = [...filters].sort(sorter);
    sortedFilterValue = value.map(({ value }) => value).sort(sorter);
    console.log({ sortedFilterValue, sortedFilters, filters });
  }

  const filtersAreEqual = isEqual(sortedFilterValue, sortedFilters);

  React.useEffect(() => {
    if (driver && !filtersAreEqual) {
      driver._setState({ filters: sortedFilterValue });
      console.log(
        'settingvalue FacetsWidget',
        sortedFilterValue,
        sortedFilters,
      );
    }
  }, [sortedFilters, sortedFilterValue, driver, filtersAreEqual]);

  return <ObjectListWidget {...props} />;
}
