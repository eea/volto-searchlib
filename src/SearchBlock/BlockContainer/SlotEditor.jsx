/**
 * An editor to edit slots as tabs based on states
 */

import React from 'react';
import { Tab, Button } from 'semantic-ui-react';
import { SEARCH_STATES } from '@eeacms/search';
import { Icon } from '@plone/volto/components';
import BlockContainer from './BlockContainer';
import clearSVG from '@plone/volto/icons/delete.svg';
import cx from 'classnames';

export default function SlotEditor(props) {
  const {
    slot,
    data,
    selectedSlotFill,
    onChangeSlotfill,
    onDeleteSlotfill,
    onSelectSlotfill,
    // properties,
    metadata,
    mode,
  } = props;

  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <Tab
      className="aboveSearchblockOverlay"
      activeIndex={activeIndex}
      panes={SEARCH_STATES.map(([state, label]) => {
        const blockId = `${slot}-${state}`;
        const hasData = !!data?.[blockId];
        return {
          menuItem: (el, { active, index }) => {
            return (
              <div className={cx('menu item', { active })} key={index}>
                <Button
                  as="a"
                  icon
                  compact
                  basic
                  className={hasData ? 'redMenuButton' : null}
                  onClick={() => setActiveIndex(index)}
                >
                  {label}
                </Button>
                {active && hasData && (
                  <Button
                    as="a"
                    icon
                    basic
                    title="Delete block"
                    aria-label="Delete block"
                    onClick={() => onDeleteSlotfill(blockId)}
                  >
                    <Icon name={clearSVG} size="24px" />
                  </Button>
                )}
              </div>
            );
          },
          render: () => (
            <Tab.Pane>
              <BlockContainer
                key={blockId}
                selected={selectedSlotFill === blockId}
                block={blockId}
                mode={mode}
                data={data?.[blockId]}
                onChangeSlotfill={onChangeSlotfill}
                onDeleteSlotfill={onDeleteSlotfill}
                onSelectSlotfill={onSelectSlotfill}
                properties={data?.[blockId]}
                metadata={metadata}
              />
            </Tab.Pane>
          ),
        };
      })}
    />
  );
}
