import React from 'react';

import { Dropdown } from 'semantic-ui-react';

const SortingView = (props) => {
  const { label, options, onChange } = props;
  return (
    <div className="sorting">
      <span>
        {label || 'Sort by'}
        <Dropdown
          icon="chevron down"
          selection
          floating
          options={options.map(({ label, value }) => ({ text: label, value }))}
          onChange={(e, { value }) => {
            onChange(value);
          }}
        />
      </span>
    </div>
  );
};

export default SortingView;
