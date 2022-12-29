import React from 'react';
import { RenderBlocks } from '@plone/volto/components';
import { useLocation } from 'react-router-dom';
import BlockEdit from '@plone/volto/components/manage/Blocks/Block/Edit';
import NewBlockAddButton from './NewBlockAddButton';

const style = {
  zIndex: '101',
  position: 'relative',
};

export default function BlockContainer(props) {
  // console.log('block container', props);
  const { mode, block, data, onChangeSlotfill, onDeleteSlotfill } = props;
  const location = useLocation();
  const content = {
    blocks: { [block]: data },
    blocks_layout: { items: [block] },
  };
  const metadata = {};
  const index = 0;
  return (
    <div className="aboveSearchblockOverlay" style={style}>
      {mode === 'view' ? (
        <RenderBlocks
          content={content}
          metadata={metadata}
          location={location}
        />
      ) : data ? (
        <BlockEdit
          id={block}
          block={block}
          data={data}
          type={data['@type']}
          properties={metadata}
          selected={false}
          multiSelected={false}
          onMoveBlock={() => {}}
          onDeleteBlock={() => {}}
          onChangeBlock={onChangeSlotfill}
          index={index}
        />
      ) : (
        <div>
          <NewBlockAddButton block={block} onMutateBlock={onChangeSlotfill} />
        </div>
      )}
    </div>
  );
}
