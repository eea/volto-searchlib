import 'regenerator-runtime/runtime'; // compatibility with react-speech-recognition

import installConfig from '@eeacms/globalsearch';
import { registry } from '@eeacms/search';
import codeSVG from '@plone/volto/icons/code.svg';
import SearchBlockView from './SearchBlock/SearchBlockView';
import SearchBlockEdit from './SearchBlock/SearchBlockEdit';

const applyConfig = (config) => {
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

  config.settings.searchlib = registry;
  return config;
};

export const installGlobalSearch = (config) => {
  config.settings.searchlib = installConfig(config.settings.searchlib);
};

export default applyConfig;
