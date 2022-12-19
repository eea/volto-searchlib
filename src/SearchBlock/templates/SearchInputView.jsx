import React from 'react';

import { SearchInputApp } from '@eeacms/search';
import { useHistory } from 'react-router-dom';
import { flattenToAppURL } from '@plone/volto/helpers';

function SearchInputView(props) {
  const { registry, appName } = props;
  const history = useHistory();
  const appConfig = registry.searchui[appName];
  const url = flattenToAppURL(appConfig.url || '');

  return (
    <SearchInputApp
      {...props}
      onSubmitSearch={(searchTerm) => {
        history.push(`${url}?q=${searchTerm}`);
      }}
    />
  );
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
