import React from 'react';
import { SearchDriver } from '@elastic/search-ui';
import { atom, useAtom } from 'jotai';

const stateFields = [
  'current',
  'filters',
  'resultsPerPage',
  'searchTerm',
  'sortDirection',
  'sortField',
  'sortList',
];

const filterActions = ['removeFilter', 'setFilter', 'addFilter'];

const buildDriver = (searchContext, onSearchTrigger) => {
  const initialState = Object.assign(
    {},
    ...stateFields.map((k) => ({ [k]: searchContext[k] })),
  );

  const driver = new SearchDriver({
    // debug: true,
    initialState,
    trackUrlState: false,
    onSearch: () =>
      new Promise(() => {
        // copy the state filters to the driver filters
        driver.filters = driver.state.filters;
        onSearchTrigger && onSearchTrigger();
      }),
  });
  driver.isReplacementSearchContext = true;

  return driver;
};

const getSearchContext = (driver) => {
  const searchContext = {
    ...driver.state,
    ...driver,
  };
  return searchContext;
};

const driverAtom = atom();
const dirtyFiltersMap = {}; // namespaced local state

export default function useProxiedSearchContext(
  searchContext,
  searchContextId = 'default',
) {
  const [driver, setDriver] = useAtom(driverAtom);
  const [, setSerial] = React.useState();

  React.useEffect(() => {
    const driver = buildDriver(searchContext, () => setSerial(new Date()));
    filterActions.forEach((name) => {
      const action = driver.actions[name];
      const func_name = `handle_${name}`;
      const wrapper = {
        // a dynamic function name, for better debugging
        [func_name]: function () {
          const filter = { field: arguments[0], type: arguments[2] };
          const dirtyFilters = Array.from(
            new Set([...(dirtyFiltersMap[searchContextId] || []), filter]),
          );
          dirtyFiltersMap[searchContextId] = dirtyFilters;
          // console.log('call', func_name, arguments);
          return action.apply(driver, arguments);
        },
      };
      driver[name] = wrapper[func_name];
    });
    setDriver(driver);
  }, [searchContext, setDriver, searchContextId]); // dirtyFilters, setDirtyFilters

  const applySearch = React.useCallback(() => {
    // searchContext.reset();
    // searchContext.setCurrent(driver.state.current);
    // searchContext.setSort(driver.state.sortField, driver.state.sortDirection);
    // searchContext.setResultsPerPage(driver.state.resultsPerPage);
    // searchContext.setSearchTerm(driver.state.searchTerm);
    // console.log(driver.state.filters, driver.filters);
    const dirtyFilters = dirtyFiltersMap[searchContextId] || [];
    dirtyFilters.forEach(({ field, type }) => {
      searchContext.removeFilter(field, null, type);
    });
    driver.state.filters.forEach((f) => {
      searchContext.removeFilter(f.field, null, f.type);
      searchContext.addFilter(f.field, f.values, f.type);
    });
  }, [searchContext, driver, searchContextId]);

  const sc = driver ? getSearchContext(driver) : searchContext;
  if (driver) {
    // this is updated async. The state update with Date is used to force refresh
    sc.facets = searchContext.facets;
  }

  const res = {
    searchContext: sc,
    applySearch,
  };

  return res;
}
