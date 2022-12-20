import React from 'react';
import { SearchBlockSchema } from './schema';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import SearchBlockView from './SearchBlockView';
import config from '@plone/volto/registry';
import { useDebouncedStableData } from './hocs';

const SearchBlockEdit = (props) => {
  const { onChangeBlock, block, data } = props;

  const stableData = useDebouncedStableData(data);

  const schema = React.useMemo(() => {
    const schema = SearchBlockSchema({ formData: stableData || {} });

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

  return (
    <div>
      <SearchBlockView {...props} mode="edit" />
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
    </div>
  );
};

export default SearchBlockEdit;
