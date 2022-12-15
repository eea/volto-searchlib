import React from 'react';
import config from '@plone/volto/registry';
import { SearchApp } from '@eeacms/search';
import { SearchBlockSchema } from './schema';
import { BodyClass } from '@plone/volto/helpers';
import { applyBlockSettings } from './utils';

// import '@elastic/react-search-ui-views/lib/styles/styles.css';
import './less/styles.less';

const overlayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '100',
};

export default function SearchBlockView(props) {
  const { data = {}, mode = 'view' } = props;
  const schema = SearchBlockSchema(props);
  const { appName = 'default' } = data;
  const registry = applyBlockSettings(
    config.settings.searchlib,
    appName,
    data,
    schema,
  );

  // TODO: this is a hack, please solve it properly
  registry.searchui[appName] = {
    ...registry.searchui[appName],
    requestParams: {
      ...(data.rawIndex
        ? {
            params: {
              index: data.rawIndex,
            },
          }
        : {}),
    },
  };

  return (
    <BodyClass className={`${appName}-view searchlib-page`}>
      <div className="searchlib-block">
        {mode !== 'view' ? (
          <div className="overlay" style={overlayStyle}></div>
        ) : (
          ''
        )}
        <SearchApp registry={registry} appName={appName} mode={mode} />
      </div>
    </BodyClass>
  );
}
