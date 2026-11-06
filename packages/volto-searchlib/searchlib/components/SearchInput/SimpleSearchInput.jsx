/**
 * A simple search input. A copy of the searchui search input
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useAppConfig } from '@eeacms/search/lib/hocs/appConfig';

function SearchInput({ getAutocomplete, getButtonProps, getInputProps }) {
  const { appConfig } = useAppConfig();
  let inputProps = getInputProps();
  const { searchInputPlaceholder = '' } = appConfig;
  inputProps.placeholder = searchInputPlaceholder;

  return (
    <>
      <div className="sui-search-box__wrapper">
        <input {...inputProps} />
        {getAutocomplete()}
      </div>
      <input {...getButtonProps()} />
    </>
  );
}

SearchInput.propTypes = {
  getAutocomplete: PropTypes.func.isRequired,
  getButtonProps: PropTypes.func.isRequired,
  getInputProps: PropTypes.func.isRequired,
};

export default SearchInput;
