import { useMemo } from 'react';

const range = (start, end) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const usePaging = ({ totalResults, resultsPerPage, current }) => {
  const paginationRange = useMemo(() => {
    const siblingCount = 2;
    const initialItemCount = 5;
    const totalPageCount = Math.ceil(totalResults / resultsPerPage);
    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, totalPageCount);
    const paginationRange = range(leftSiblingIndex, rightSiblingIndex);
    const firstSection = leftSiblingIndex > 2;
    const lastSection = rightSiblingIndex < totalPageCount - 1;

    if (!firstSection && lastSection) {
      let leftRange = range(1, initialItemCount);
      return [...leftRange];
    }

    if (firstSection && !lastSection) {
      let rightRange = range(
        totalPageCount - initialItemCount + 1,
        totalPageCount,
      );
      return [...rightRange];
    }

    return paginationRange;
  }, [totalResults, resultsPerPage, current]);

  return paginationRange;
};
