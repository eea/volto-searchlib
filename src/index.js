import 'regenerator-runtime/runtime'; // compatibility with react-speech-recognition

import { registry } from '@eeacms/search';
import codeSVG from '@plone/volto/icons/code.svg';
import SearchBlockView from './SearchBlock/SearchBlockView';
import SearchBlockEdit from './SearchBlock/SearchBlockEdit';
// import LeftColumnLayout from './components/Layout/LeftColumnLayout';

import SelectWidget from './SearchBlock/SelectWidget';

const applyConfig = (config) => {
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

    const handler = createHandler();

    const middleware = express.Router();
    middleware.use(express.json({ limit: config.settings.maxResponseSize }));
    middleware.use(express.urlencoded({ extended: true }));
    middleware.all('**/_es/*', handler);
    middleware.id = 'esProxyMiddleware';

    config.settings.expressMiddleware = [
      ...config.settings.expressMiddleware,
      middleware,
    ];
  }
  return config;
};

export default applyConfig;
