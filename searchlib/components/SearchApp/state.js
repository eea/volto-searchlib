import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { SearchDriver } from '@elastic/search-ui';

export const loadingFamily = atomFamily(
  () => atom(),
  (a, b) => a.appName === b.appName,
);

export const driverFamily = atomFamily(
  ({ elasticConfig, appName, uniqueId }) => {
    const driver = __CLIENT__ ? new SearchDriver(elasticConfig) : null;
    // console.log('new driver', elasticConfig, appName, uniqueId);
    return atom(driver);
  },
  (a, b) => `${a.appName}-${a.uniqueId}` === `${b.appName}-${b.uniqueId}`,
);
