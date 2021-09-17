import React from 'react';
import config from '@plone/volto/registry';
import { SearchApp } from '@eeacms/search';

import '@elastic/react-search-ui-views/lib/styles/styles.css';
import './styles.less';

export default function SearchBlockView({ data = {} }) {
  const { appName = 'default' } = data;
  const registry = config.settings.searchlib;
  console.log(config.settings.searchlib);
  return (
    <div className="searchlib-block">
      <SearchApp registry={registry} appName={appName} />
    </div>
  );
}
