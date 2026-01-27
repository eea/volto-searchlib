import React from 'react';
import { compose } from 'redux';
import superagent from 'superagent';
import { SearchBlockSchema } from './schema';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import config from '@plone/volto/registry';
import withOnyxData from '@eeacms/volto-eea-chatbot/ChatBlock/hocs/withOnyxData';
import SearchBlockView from './SearchBlockView';
import { useDebouncedStableData } from './hocs';
import './edit.less';

const SearchBlockEdit = (props) => {
  const { onChangeBlock, block, data, assistants } = props;
  const [selectedSlotFill, onSelectSlotfill] = React.useState();

  const stableData = useDebouncedStableData(
    Object.assign(
      {},
      ...Object.keys(data)
        .filter((k) => k !== 'slotFills')
        .map((k) => ({ [k]: data[k] })),
    ),
  );

  const schema = React.useMemo(() => {
    const schema = SearchBlockSchema({ formData: stableData, assistants });

    const { searchui } = config.settings.searchlib;

    schema.properties.appName.choices = Object.keys(searchui).map((k) => [
      k,
      k,
      // conf[k].title || k,
    ]);

    schema.appName = stableData.appName || 'default';
    schema.appConfig = searchui[schema.appName];
    schema.registry = config.settings.searchlib;

    return schema;
  }, [assistants, stableData]);

  const onChangeSlotfill = React.useCallback(
    (slotId, value) => {
      const newValue = {
        ...data,
        slotFills: {
          ...(data.slotFills || {}),
          [slotId]: {
            ...(data?.slotFills?.[slotId] || {}),
            ...value,
          },
        },
      };
      onChangeBlock(block, newValue);
    },
    [block, data, onChangeBlock],
  );

  const onDeleteSlotfill = React.useCallback(
    (slotId) => {
      onChangeBlock(block, {
        ...data,
        slotFills: {
          ...(data.slotFills || {}),
          [slotId]: undefined,
        },
      });
    },
    [block, onChangeBlock, data],
  );

  return (
    <div>
      <SearchBlockView
        {...props}
        mode="edit"
        onChangeSlotfill={onChangeSlotfill}
        onDeleteSlotfill={onDeleteSlotfill}
        onSelectSlotfill={onSelectSlotfill}
        selectedSlotFill={selectedSlotFill}
      >
        <SidebarPortal selected={props.selected}>
          <BlockDataForm
            schema={schema}
            title={schema.title}
            block={block}
            onChangeBlock={onChangeBlock}
            onChangeField={(id, value) => {
              onChangeBlock(props.block, {
                ...props.data,
                [id]: value,
              });
            }}
            formData={props.data}
          />
        </SidebarPortal>
      </SearchBlockView>
    </div>
  );
};

export default compose(
  withOnyxData(() => [
    'assistants',
    superagent.get('/_da/persona?include_deleted=false').type('json'),
  ]),
  // withOnyxData(() => ['tool', superagent.get('/_da/tool').type('json')]), // May be needed in the future
)(SearchBlockEdit);
