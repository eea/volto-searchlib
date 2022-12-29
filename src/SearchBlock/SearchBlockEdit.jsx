import React from 'react';
import { SearchBlockSchema } from './schema';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import SearchBlockView from './SearchBlockView';
import config from '@plone/volto/registry';
import { useDebouncedStableData } from './hocs';
import useWhyDidYouUpdate from '@eeacms/search/lib/hocs/useWhyDidYouUpdate';

const SearchBlockEdit = (props) => {
  const { onChangeBlock, block, data } = props;

  const stableData = useDebouncedStableData(
    Object.assign(
      {},
      ...Object.keys(data)
        .filter((k) => k !== 'slotFills')
        .map((k) => ({ [k]: data[k] })),
    ),
  );

  const schema = React.useMemo(() => {
    const schema = SearchBlockSchema({ formData: stableData });

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
  }, [stableData]);

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

  React.useEffect(() => () => console.log('unmount SearchBlockEdit'), []);

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

  useWhyDidYouUpdate('SearchBlockEdit', { schema });

  return (
    <div>
      <SearchBlockView
        {...props}
        mode="edit"
        onChangeSlotfill={onChangeSlotfill}
        onDeleteSlotfill={onDeleteSlotfill}
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

export default SearchBlockEdit;
