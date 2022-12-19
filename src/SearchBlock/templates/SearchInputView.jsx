import { SearchInputApp } from '@eeacms/search';
import React from 'react';

function SearchInputView(props) {
  return <SearchInputApp {...props} />;
}

SearchInputView.schemaEnhancer = ({ schema }) => {
  schema.fieldsets[0].fields.push('url');
  schema.properties.url = {
    title: 'Results page',
    widget: 'url',
    configPath: 'url',
  };

  return schema;
};

export default SearchInputView;
