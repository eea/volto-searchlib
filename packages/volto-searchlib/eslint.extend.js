const path = require('path');

module.exports = {
  modify(defaultConfig) {
    const aliasMap = defaultConfig.settings['import/resolver'].alias.map;
    const addonPath = aliasMap.find(
      ([name]) => name === '@eeacms/volto-searchlib',
    )[1];

    const searchlibPath = path.resolve(`${addonPath}/../searchlib`);
    aliasMap.push(['@eeacms/search', searchlibPath]);

    return defaultConfig;
  },
};
