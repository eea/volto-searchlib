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
          aboveSearchInput={
            <BlockContainer
              block="aboveSearchInput"
              data={slotFills?.['aboveSearchInput']}
              mode={mode}
              onChangeSlotfill={onChangeSlotfill}
              onDeleteSlotfill={onDeleteSlotfill}
            />
          }
          belowSearchInput={
            <BlockContainer
              block="belowSearchInput"
              data={slotFills?.['belowSearchInput']}
              mode={mode}
              onChangeSlotfill={onChangeSlotfill}
              onDeleteSlotfill={onDeleteSlotfill}
            />
          }
          aboveResults={
            <BlockContainer
              block="aboveResults"
              data={slotFills?.['aboveResults']}
              mode={mode}
              onChangeSlotfill={onChangeSlotfill}
              onDeleteSlotfill={onDeleteSlotfill}
            />
          }
          belowResults={
            <BlockContainer
              block="belowResults"
              data={slotFills?.['belowResults']}
              mode={mode}
              onChangeSlotfill={onChangeSlotfill}
              onDeleteSlotfill={onDeleteSlotfill}
            />
          }
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
