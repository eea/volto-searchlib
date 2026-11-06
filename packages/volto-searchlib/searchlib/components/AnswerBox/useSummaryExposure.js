import { useEffect, useRef } from 'react';
import { trackEvent } from '@eeacms/volto-matomo/utils';
import { MATOMO_CATEGORY } from './constants';

/**
 * Count a completed search's summary/disabled state only when its content enters
 * the viewport. Keys and search terms are local deduplication data, never event
 * payloads. Missing IntersectionObserver fails closed rather than inventing views.
 */
export default function useSummaryExposure({
  enabled,
  searchTerm,
  isLoading,
  action,
  exposureKey,
}) {
  const ref = useRef(null);
  const seen = useRef(new Set());

  useEffect(() => {
    seen.current.clear();
  }, [searchTerm, isLoading]);

  useEffect(() => {
    const target = ref.current;
    if (
      !enabled ||
      isLoading ||
      !searchTerm ||
      !action ||
      !target ||
      seen.current.has(exposureKey) ||
      typeof IntersectionObserver === 'undefined'
    )
      return;

    let active = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          active &&
          !seen.current.has(exposureKey) &&
          entries.some(
            (entry) =>
              entry.target === target &&
              entry.isIntersecting &&
              entry.intersectionRatio >= 0.01,
          )
        ) {
          seen.current.add(exposureKey);
          observer.disconnect();
          trackEvent({ category: MATOMO_CATEGORY, action });
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(target);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [enabled, isLoading, searchTerm, action, exposureKey]);

  return ref;
}
