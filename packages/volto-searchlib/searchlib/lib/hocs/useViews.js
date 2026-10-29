/**
 * A hook to facilitate interactive with views (listing, card, tables)
 *
 */
import { atom, useAtom } from 'jotai';
import { useAppConfig } from './appConfig';
export const activeViewIdAtom = atom(null);

const useViews = () => {
  const [activeViewId, setActiveViewId] = useAtom(activeViewIdAtom);

  const { appConfig } = useAppConfig();
  const { resultViews } = appConfig;

  const defaultViewId =
    resultViews.filter((v) => v.isDefault)[0]?.id || 'listing';

  return {
    defaultViewId,
    activeViewId: activeViewId || defaultViewId,
    setActiveViewId,
    reset: () => setActiveViewId(defaultViewId),
  };
};

export default useViews;
