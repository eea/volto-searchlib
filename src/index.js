import 'regenerator-runtime/runtime'; // compatibility with react-speech-recognition

import { registry } from '@eeacms/search';
import codeSVG from '@plone/volto/icons/code.svg';
import SearchBlockView from './SearchBlock/SearchBlockView';
import SearchBlockEdit from './SearchBlock/SearchBlockEdit';
import { SearchBlockSchema } from './SearchBlock/schema';
import {
  FullView,
  SearchInputView,
  LandingPageView,
  SearchResultsView,
} from './SearchBlock/templates';

import FacetValueWidget from './SearchBlock/widgets/FacetValueWidget';
import SelectWidget from './SearchBlock/widgets/SelectWidget';
import SortWidget from './SearchBlock/widgets/SortWidget';

const applyConfig = (config) => {
  config.widgets.id.qa_queryTypes = SelectWidget;
  config.widgets.widget.facet_value = FacetValueWidget;
  config.widgets.widget.sort_widget = SortWidget;
  config.settings.searchlib = registry;

  config.blocks.blocksConfig.searchlib = {
    id: 'searchlib',
    title: 'EEA Semantic Search',
    icon: codeSVG,
    group: 'common',
    view: SearchBlockView,
    edit: SearchBlockEdit,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: true,
    sidebarTab: 1,
    schema: SearchBlockSchema,
    security: {
      addPermission: [],
      view: [],
    },
    variations: [
      {
        id: 'fullView',
        isDefault: true,
        title: 'Full (default)',
        view: FullView,
        schemaEnhancer: FullView.schemaEnhancer,
      },
      {
        id: 'searchInputOnly',
        title: 'Search input',
        view: SearchInputView,
        schemaEnhancer: SearchInputView.schemaEnhancer,
      },
      {
        id: 'landingPageOnly',
        title: 'Statistics',
        view: LandingPageView,
        schemaEnhancer: LandingPageView.schemaEnhancer,
      },
      {
        id: 'searchResultsOnly',
        title: 'Search results',
        view: SearchResultsView,
        schemaEnhancer: SearchResultsView.schemaEnhancer,
      },
    ],
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

    const healthCheckMiddleware = require('./middleware/healthcheck').default;
    middleware.all('**/_es_healthcheck/:id', healthCheckMiddleware);
    middleware.id = 'esHealthcheck';

    config.settings.expressMiddleware = [
      ...config.settings.expressMiddleware,
      middleware,
    ];
  }

  return config;
};

export default applyConfig;
