import 'regenerator-runtime/runtime'; // compatibility with react-speech-recognition

// import installGlobalsearch from '@eeacms/globalsearch';
// import installDatahub from '@eeacms/datahub';
// import { registry } from '@eeacms/search';
// import codeSVG from '@plone/volto/icons/code.svg';
// import SearchBlockView from './SearchBlock/SearchBlockView';
// import SearchBlockEdit from './SearchBlock/SearchBlockEdit';
// import LeftColumnLayout from './components/Layout/LeftColumnLayout';

import SelectWidget from './SearchBlock/SelectWidget';

const applyConfig = (config) => {
  return config;
  config.widgets.id.qa_queryTypes = SelectWidget;
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
    middleware.use(express.json({ limit: config.settings.maxResponseSize }));
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

// TODO: this should be moved into its own volto addon
// export const installGlobalSearch = (config) => {
//   config.settings.searchlib = installGlobalsearch(config.settings.searchlib);
//
//   const { globalsearch } = config.settings.searchlib.searchui;
//
//   // Tweak the searchlib config to use the middleware instead of the index
//   globalsearch.elastic_index = '_es/globalsearch';
//
//   return config;
// };

// TODO: this should be moved into its own volto addon
// export const installDataHub = (config) => {
//   config.settings.searchlib = installDatahub(config.settings.searchlib);
//
//   const { datahub } = config.settings.searchlib.searchui;
//
//   // Tweak the searchlib config to use the middleware instead of the index
//   datahub.elastic_index = '_es/globalsearch';
//
//   return config;
// };
//
export default applyConfig;
