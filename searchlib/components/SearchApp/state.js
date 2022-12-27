import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { SearchDriver } from '@elastic/search-ui';

export const loadingFamily = atomFamily(
  () => atom(),
  (a, b) => a.appName === b.appName,
);

export const driverFamily = atomFamily(
  ({ elasticConfig, appName }) => {
    const driver = __CLIENT__ ? new SearchDriver(elasticConfig) : null;
    return atom(driver);
  },
  (a, b) => a.appName === b.appName,
);
