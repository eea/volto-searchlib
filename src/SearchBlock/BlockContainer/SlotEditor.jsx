/**
 * An editor to edit slots as tabs based on states
 */

import React from 'react';
import { Tab } from 'semantic-ui-react';
import { SEARCH_STATES } from '@eeacms/search';
import BlockContainer from './BlockContainer';

export default function SlotEditor(props) {
  const {
    name,
    data,
    selectedSlotFill,
    onChangeSlotfill,
    onDeleteSlotfill,
    onSelectSlotfill,
    properties,
    metadata,
    mode,
  } = props;

  return (
    <Tab
      panes={SEARCH_STATES.map(([state, label]) => {
        const blockId = `${name}-${state}`;
        return {
          menuItem: label,
          render: () => (
            <Tab.Pane>
              <BlockContainer
                key={blockId}
                selected={selectedSlotFill === name}
                block={blockId}
                mode={mode}
                data={data?.[blockId]}
                onChangeSlotfill={onChangeSlotfill}
                onDeleteSlotfill={onDeleteSlotfill}
                onSelectSlotfill={onSelectSlotfill}
                properties={properties}
                metadata={metadata}
              />
            </Tab.Pane>
          ),
        };
      })}
    />
  );
}
