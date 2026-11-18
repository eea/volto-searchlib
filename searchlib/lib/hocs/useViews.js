/**
 * A hook to facilitate interactive with views (listing, card, tables)
 *
 */
import { atom, useAtom } from 'jotai';
import { useAppConfig } from './appConfig';
export const activeViewIdAtom = atom(null);

export const getDefaultViewId = (resultViews = []) =>
  resultViews.find((v) => v.isDefault)?.id || resultViews[0]?.id || 'listing';

/**
 * The active view is shared by all the search apps (e.g. `datahub` and
 * `globalsearch`) and it is kept on in-app navigation, so it can hold a view
 * that the current app doesn't have. Use the default view of the app then.
 */
export const getActiveViewId = (resultViews = [], activeViewId) =>
  activeViewId && resultViews.some((v) => v.id === activeViewId)
    ? activeViewId
    : getDefaultViewId(resultViews);

const useViews = () => {
  const [activeViewId, setActiveViewId] = useAtom(activeViewIdAtom);

  const { appConfig } = useAppConfig();
  const { resultViews } = appConfig;

  const defaultViewId = getDefaultViewId(resultViews);

  return {
    defaultViewId,
    activeViewId: getActiveViewId(resultViews, activeViewId),
    setActiveViewId,
    reset: () => setActiveViewId(defaultViewId),
  };
};

export default useViews;
