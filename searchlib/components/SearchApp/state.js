import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const loadingFamily = atomFamily(() => atom());

export const useLoadingState = (appName) => {
  const loadingAtom = loadingFamily(appName);
  return useAtom(loadingAtom);
};
