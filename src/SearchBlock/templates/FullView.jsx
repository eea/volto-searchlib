import React from 'react';
import { BodyClass } from '@plone/volto/helpers';
import { SEARCH_STATES, SLOTS, SearchApp } from '@eeacms/search';
import { SlotEditor, BlockContainer } from './../BlockContainer';
import { searchResultsSchemaEnhancer } from './schema';

const slotCombinations = SLOTS.reduce(
  (acc, slot) => [
    ...acc,
    ...SEARCH_STATES.map((state) => `${slot}-${state[0]}`),
  ],
  [],
);

function FullView(props) {
  const {
    appName,
    mode,
    slotFills,
    onChangeSlotfill,
    onDeleteSlotfill,
    onSelectSlotfill,
    selectedSlotFill,
    properties,
    metadata,
  } = props;

  // TODO: (about bodyclass) this is a hack, please solve it properly

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' && (
          <div
            role="presentation"
            onKeyDown={() => onSelectSlotfill(null)}
            className="searchlib-edit-overlay"
            onClick={() => onSelectSlotfill(null)}
          ></div>
        )}
        <SearchApp
          {...props}
          {...Object.assign(
            {},
            ...(mode === 'view'
              ? slotCombinations.map((blockId) => {
                  const fallbackId = `${blockId.split('-')[0]}-any`;
                  return {
                    [blockId]: (
                      <BlockContainer
                        key={blockId}
                        selected={false}
                        block={blockId}
                        mode={mode}
                        data={
                          slotFills?.[blockId]
                            ? slotFills?.[blockId]
                            : mode === 'view'
                            ? slotFills?.[fallbackId]
                            : null
                        }
                        onChangeSlotfill={onChangeSlotfill}
                        onDeleteSlotfill={onDeleteSlotfill}
                        onSelectSlotfill={onSelectSlotfill}
                        properties={properties}
                        metadata={metadata}
                      />
                    ),
                  };
                })
              : SLOTS.map((name) => ({
                  [name]: (
                    <SlotEditor
                      key={name}
                      slot={name}
                      data={slotFills}
                      mode={mode}
                      onChangeSlotfill={onChangeSlotfill}
                      onDeleteSlotfill={onDeleteSlotfill}
                      onSelectSlotfill={onSelectSlotfill}
                      selectedSlotFill={selectedSlotFill}
                      properties={properties}
                      metadata={metadata}
                    />
                  ),
                }))),
          )}
        />
      </div>
    </BodyClass>
  );
}

FullView.schemaEnhancer = (props) => {
  // searchResultsSchemaEnhancer;
  const schema = searchResultsSchemaEnhancer(props);
  schema.fieldsets[1].fields = [
    ...schema.fieldsets[1].fields,
    'showLandingPage',
    'showDownloadButton',
  ];
  schema.properties.showLandingPage = {
    title: 'Show intro statistics?',
    type: 'boolean',
    default: true,
    configPath: 'showLandingPage',
  };
  schema.properties.showDownloadButton = {
    title: 'Show download button?',
    type: 'boolean',
    default: false,
    configPath: 'showDownloadButton',
  };
  return schema;
};

export default FullView;
