import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const loadingFamily = atomFamily(
  () => atom(),
  (a, b) => a.appName === b.appName,
);
