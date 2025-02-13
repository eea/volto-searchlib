import React from 'react';

import { Dropdown } from 'semantic-ui-react';
import { useSearchContext, useWindowDimensions } from '@eeacms/search/lib/hocs';

const SortingViewComponent = (props) => {
  const { options, onChange } = props;
  let { label } = props;
  const searchContext = useSearchContext();
  const { sortField, sortDirection } = searchContext;
  const sortOptions = options.map(({ label, value }) => {
    return { text: label, value };
  });

  const activeValue = `${sortField}|||${sortDirection}`;

  const activeLabel = sortOptions.filter(
    ({ value }) => value === activeValue,
  )[0].text;

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 1000;

  // let label = 'Sort by';
  if (isSmallScreen) {
    label = '';
  }

  return (
    <div className="sorting">
      <Dropdown
        icon="chevron down"
        trigger={
          <span>
            {label ? `${label}: ` : ''}
            <span>{`${activeLabel}`}</span>
          </span>
        }
        inline
        value={activeValue}
        options={sortOptions}
        onChange={(e, { value }) => {
          onChange(value);
        }}
      />
    </div>
  );
};

const SortingView = (props) => <SortingViewComponent {...props} />;

export default SortingView;
