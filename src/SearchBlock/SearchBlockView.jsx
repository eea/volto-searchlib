import React from 'react';
import config from '@plone/volto/registry';
import { cloneDeep } from 'lodash';
import { SearchApp } from '@eeacms/search';
import { SearchBlockSchema } from './schema';
import { BodyClass } from '@plone/volto/helpers';

import '@elastic/react-search-ui-views/lib/styles/styles.css';
import './less/styles.less';

/**
 * Reuse the schema to allow pinpointing in the config, to allow adjusting the
 * data based on the schema definition.
 *
 * There's two styles of pinpointing:
 *
 * - with `configPath` you can use a dotted path to the key name
 * - with `modifyConfig` you can write a function that can change the settings
 *
 */
const applyBlockSettings = (config, appName, data, schema) => {
  // apply mutations inline to the config

  config = cloneDeep(config);
  // TODO: this has the side-effect that it mutates the global config
  // Viewing this block will also "fix" the global config for the middleware
  const settings = config.searchui[appName];
  Object.keys(data).forEach((fieldName) => {
    const field = schema.properties[fieldName];
    if (!field) return;
    const { configPath, modifyConfig } = field;
    if (modifyConfig) {
      modifyConfig(settings, data[fieldName]);
    } else if (!configPath) {
      return config;
    } else {
      const [key, ...bits] = configPath.split('.').reverse();
      bits.reverse();
      let branch = settings;
      bits.forEach((bit) => {
        if (Object.keys(branch).indexOf(bit) === -1) {
          branch[bit] = {};
        }
        branch = branch[bit];
      });
      // console.log('set', { branch, key, field: data[fieldName], fieldName });
      branch[key] = data[fieldName];
    }
  });
  return config;
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
  registry.searchui.globalsearch.requestParams = {
    params: {
      index: data.rawIndex,
    },
  };
  // console.log('registry', registry);
  return (
    <BodyClass className="searchlib-page">
      <div className="searchlib-block">
        <SearchApp registry={registry} appName={appName} mode={mode} />
      </div>
    </BodyClass>
  );
}
