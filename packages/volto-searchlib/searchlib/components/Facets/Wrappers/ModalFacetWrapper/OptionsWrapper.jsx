import React from 'react';
import { Modal } from 'semantic-ui-react'; // , Header, Image
import { useFilterState } from './state';

import { useSearchContext, useAppConfig } from '@eeacms/search/lib/hocs';
import { normalize_state } from './state';

const getOptions = (state, options) => {
  const { tmp_state, has_names } = normalize_state(state);

  let newOptions = has_names
    ? options.map(({ value, count, selected }) => ({
        value,
        count,
        // TODO: also handle histogram facet
        selected: tmp_state.includes(
          typeof value === 'object' ? value.name : value,
        )
          ? true
          : false,
      }))
    : tmp_state;
  return newOptions;
};

const OptionsWrapper = (props) => {
  const { options, view, facet, field, filterExact, ...rest } = props;
  const searchContext = useSearchContext();
  const { registry } = useAppConfig();
  const { filters, facetOptions } = searchContext;
  const View = view;

  const [state, dispatch] = useFilterState(field);

  const derivedOptions = getOptions(state, options);

  const renderContent = React.useCallback(({ children }) => {
    return (
      <Modal.Content image scrolling>
        {children}
      </Modal.Content>
    );
  }, []);

  const optionsFilter = facet.optionsFilter
    ? registry.resolve[facet.optionsFilter]
    : null;

  return (
    <View
      {...rest}
      {...searchContext}
      HeaderWrapper={Modal.Header}
      ContentWrapper={renderContent}
      options={
        optionsFilter ? optionsFilter(derivedOptions, filters) : derivedOptions
      }
      availableOptions={facetOptions[field]}
      filterExact={filterExact}
      onSelect={(value, force) => {
        if (filterExact) {
          dispatch({ type: 'set', force: true, value });
        } else {
          dispatch({ type: 'set', force, value });
        }
      }}
      onRemove={(value) => {
        dispatch({ type: 'remove', value });
      }}
    />
  );
};

export default OptionsWrapper;
