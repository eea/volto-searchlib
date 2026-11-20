import { atom, useAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';

// TODO: use a request family
export const landingPageRequestFamily = atomFamily(() => atom());

export const useLandingPageRequest = (appName) => {
  const loadingAtom = landingPageRequestFamily(appName);
  return useAtom(loadingAtom);
};

export const landingPageDataFamily = atomFamily(() => atom());

export const useLandingPageData = (appName) => {
  const loadingAtom = landingPageDataFamily(appName);
  return useAtom(loadingAtom);
};
