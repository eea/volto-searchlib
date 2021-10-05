import React from 'react';
import { SearchBlockSchema } from './schema';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import SearchBlockView from './SearchBlockView';
import config from '@plone/volto/registry';

const SearchBlockEdit = (props) => {
  const schema = SearchBlockSchema(props);
  const conf = config.settings.searchlib.searchui;
  schema.properties.appName.choices = Object.keys(conf).map((k) => [
    k,
    k,
    // conf[k].title || k,
  ]);

  return (
    <div>
      <SearchBlockView {...props} mode="edit" />
      <SidebarPortal selected={props.selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
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
