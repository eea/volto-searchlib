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

// aboveSearchInput={
//   <BlockContainer
//     block="aboveSearchInput"
//     data={slotFills?.['aboveSearchInput']}
//     mode={mode}
//     onChangeSlotfill={onChangeSlotfill}
//     onDeleteSlotfill={onDeleteSlotfill}
//   />
// }
// belowSearchInput={
//   <BlockContainer
//     block="belowSearchInput"
//     data={slotFills?.['belowSearchInput']}
//     mode={mode}
//     onChangeSlotfill={onChangeSlotfill}
//     onDeleteSlotfill={onDeleteSlotfill}
//   />
// }
// aboveResults={
//   <BlockContainer
//     block="aboveResults"
//     data={slotFills?.['aboveResults']}
//     mode={mode}
//     onChangeSlotfill={onChangeSlotfill}
//     onDeleteSlotfill={onDeleteSlotfill}
//   />
// }
// belowResults={
//   <BlockContainer
//     block="belowResults"
//     data={slotFills?.['belowResults']}
//     mode={mode}
//     onChangeSlotfill={onChangeSlotfill}
//     onDeleteSlotfill={onDeleteSlotfill}
//   />
// }

function FullView(props) {
  const {
    appName,
    mode,
    slotFills,
    onChangeSlotfill,
    onDeleteSlotfill,
    onSelectSlotfill,
    selectedSlotFill,
  } = props;

  // TODO: (about bodyclass) this is a hack, please solve it properly

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div
            role="presentation"
            onKeyDown={() => onSelectSlotfill(null)}
            className="overlay"
            style={overlayStyle}
            onClick={() => onSelectSlotfill(null)}
          ></div>
        )}
        <SearchApp
          {...props}
          {...Object.assign(
            {},
            ...slots.map((name) => ({
              [name]: (
                <BlockContainer
                  key={name}
                  block={name}
                  data={slotFills?.[name]}
                  mode={mode}
                  onChangeSlotfill={onChangeSlotfill}
                  onDeleteSlotfill={onDeleteSlotfill}
                  onSelectSlotfill={onSelectSlotfill}
                  selected={selectedSlotFill === name}
                />
              ),
            })),
          )}
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
