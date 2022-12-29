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

const getBlocks = (slotFills = {}, mode = 'view', props) => {
  return Object.assign(
    {},
    ...slots.map((name) => ({
      [name]: (
        <BlockContainer
          block={name}
          data={slotFills[name]}
          mode={mode}
          {...props}
        />
      ),
    })),
  );
};

function FullView(props) {
  const {
    appName,
    mode,
    slotFills,
    onChangeSlotfill,
    onDeleteSlotfill,
  } = props;

  // TODO: (about bodyclass) this is a hack, please solve it properly

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div className="overlay" style={overlayStyle}></div>
        )}
        <SearchApp
          {...props}
          slotFills={getBlocks(slotFills, mode, {
            onChangeSlotfill,
            onDeleteSlotfill,
          })}
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
