import React from 'react';
import { usePaging } from './usePaging';
import { Button } from 'semantic-ui-react';
import { useSearchContext } from '@eeacms/search/lib/hocs';
import cx from 'classnames';
// import PagingPrevNext from './../PagingInfo/PagingPrevNext';
// import { PagingInfo as SUIPagingInfo } from '@elastic/react-search-ui';

function Paging({ className, onChange, ...rest }) {
  const searchContext = useSearchContext();
  const {
    current,
    setCurrent,
    totalPages,
    totalResults,
    resultsPerPage,
  } = searchContext;

  const paginationRange = usePaging({
    current,
    totalResults,
    resultsPerPage,
  });

  const goToNext = () => {
    setCurrent(current + 1);
  };

  const goToPrev = () => {
    setCurrent(current - 1);
  };

  return (
    <div className="paging-wrapper">
      {current > 1 ? (
        <>
          <Button
            onClick={() => setCurrent(1)}
            className="prev double-angle"
            title="First page"
          />
          <Button
            onClick={() => goToPrev()}
            className="prev single-angle"
            title="Previous page"
          />
        </>
      ) : null}

      {/*<SUIPagingInfo view={PagingPrevNext} />*/}

      {paginationRange.map((pageNumber, index) => {
        return (
          <Button
            key={index}
            className={cx('pagination-item', {
              active: pageNumber === current,
            })}
            onClick={() => setCurrent(pageNumber)}
          >
            {pageNumber}
          </Button>
        );
      })}

      {current < totalPages ? (
        <>
          <Button
            onClick={() => goToNext()}
            className="next single-angle"
            title="Next page"
          />
          <Button
            onClick={() => setCurrent(totalPages)}
            className="next double-angle"
            title="Last page"
          />
        </>
      ) : null}
    </div>
  );
}

export default Paging;
