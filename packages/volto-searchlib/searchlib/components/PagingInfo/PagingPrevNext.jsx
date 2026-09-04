import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const PagingPrevNext = ({
  className,
  end,
  searchTerm,
  start,
  totalResults,
  ...rest
}) => {
  return (
    <div className={cx('sui-paging-info', className)} {...rest}>
      Results {start} - {end} of {totalResults}{' '}
    </div>
  );
};

PagingPrevNext.propTypes = {
  end: PropTypes.number.isRequired,
  searchTerm: PropTypes.string.isRequired,
  start: PropTypes.number.isRequired,
  totalResults: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default PagingPrevNext;
