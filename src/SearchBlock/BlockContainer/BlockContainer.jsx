import React from 'react';
import { useLocation } from 'react-router-dom';
import { RenderBlocks } from '@plone/volto/components';
import config from '@plone/volto/registry';
import BlockEdit from '@plone/volto/components/manage/Blocks/Block/Edit';
import NewBlockAddButton from './NewBlockAddButton';

export default function BlockContainer(props) {
  const {
    mode,
    block,
    data,
    selected = false,
    onChangeSlotfill,
    // onDeleteSlotfill,
    onSelectSlotfill,
    properties,
    metadata,
  } = props;
  const location = useLocation();
  const content = {
    blocks: { [block]: data },
    blocks_layout: { items: [block] },
  };
  const index = 0;

  const blocksConfig = React.useMemo(
    () =>
      Object.assign(
        {},
        ...Object.entries(config.blocks.blocksConfig).map(
          ([blockId, blockConfig]) => ({
            [blockId]: { ...blockConfig, blockHasOwnFocusManagement: true },
          }),
        ),
      ),
    [],
  );

  if (mode !== 'view')
    return data ? (
      <BlockEdit
        id={block}
        block={block}
        data={data}
        type={data['@type']}
        properties={properties}
        metadata={metadata}
        selected={selected}
        multiSelected={false}
        onFocusNextBlock={() => {}}
        onFocusPreviousBlock={() => {}}
        onAddBlock={() => {}}
        onMutateBlock={() => {}}
        onChangeBlock={onChangeSlotfill}
        onDeleteBlock={() => {}}
        onInsertBlock={() => {}}
        onMoveBlock={() => {}}
        onSelectBlock={(id, isSelected) => onSelectSlotfill(id)}
        pathname={location.pathname}
        index={index}
        blocksConfig={blocksConfig}
      />
    ) : (
      <div className="block-wrapper">
        <NewBlockAddButton block={block} onMutateBlock={onChangeSlotfill} />
      </div>
    );

  return (
    mode === 'view' &&
    (data ? (
      <RenderBlocks content={content} metadata={metadata} location={location} />
    ) : null)
  );
}
