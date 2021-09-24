import 'regenerator-runtime/runtime'; // compatibility with react-speech-recognition

import installConfig from '@eeacms/globalsearch';
import { registry } from '@eeacms/search';
import codeSVG from '@plone/volto/icons/code.svg';
import SearchBlockView from './SearchBlock/SearchBlockView';
import SearchBlockEdit from './SearchBlock/SearchBlockEdit';
import LeftColumnLayout from './components/Layout/LeftColumnLayout';

const applyConfig = (config) => {
  config.settings.searchlib = registry;

  config.blocks.blocksConfig.searchlib = {
    id: 'searchlib',
    title: 'Searchlib',
    icon: codeSVG,
    group: 'common',
    view: SearchBlockView,
    edit: SearchBlockEdit,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  if (__SERVER__) {
    const express = require('express');
    const { createHandler } = require('./middleware/elasticsearch');

    const handler = createHandler({
      urlES: process.env.RAZZLE_PROXY_ES_DSN || 'http://localhost:9200/_all',
      urlNLP: process.env.RAZZLE_PROXY_QA_DSN || 'http://localhost:8000/api',
    });

    const middleware = express.Router();
    middleware.use(express.json());
    middleware.use(express.urlencoded({ extended: true }));
    middleware.all('**/_es/*', handler);
    middleware.id = 'esProxyMiddleware';

    config.settings.expressMiddleware = [
      middleware,
      ...config.settings.expressMiddleware,
    ];
  }
  return config;
};

export const installGlobalSearch = (config) => {
  // config.settings.devProxyToApiPath = false;
  config.settings.searchlib = installConfig(config.settings.searchlib);
  config.settings.searchlib.resolve.LeftColumnLayout.component = LeftColumnLayout;

  const { globalsearch } = config.settings.searchlib.searchui;

  globalsearch.elastic_index = '_es/globalsearch';
  globalsearch.layoutComponent = 'LeftColumnLayout';

  return config;
};

export default applyConfig;
