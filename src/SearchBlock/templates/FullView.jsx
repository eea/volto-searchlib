import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { SearchApp } from '@eeacms/search';
import { BlockContainer } from './../BlockContainer';

const overlayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '100',
};

const slots = [
  'aboveSearchInput',
  'belowSearchInput',
  'aboveResults',
  'belowResults',
];

const getBlocks = (slotFills = {}, mode = 'view') => {
  return Object.assign(
    {},
    slots.map((name) => ({
      [name]: <BlockContainer block={name} data={slotFills[name]} />,
    })),
  );
};

function FullView(props) {
  const { appName, mode } = props;

  // TODO: (about bodyclass) this is a hack, please solve it properly

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div className="overlay" style={overlayStyle}></div>
        )}
        <SearchApp
          {...props}
          slotFills={getBlocks(props.data?.slotFills, mode)}
        />
        {props.children}
      </div>
    </BodyClass>
  );
}

FullView.schemaEnhancer = ({ schema }) => {
  // schema.fieldsets[0].fields.unshift('defaultResultView');

  return schema;
};

export default FullView;
