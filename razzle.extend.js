const path = require('path');
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');

const pkgs = ['@eeacms/search'];

module.exports = {
  plugins: (plugs) => plugs,
  modifyWebpackConfig({
    env: { target, dev },
    webpackConfig,
    webpackObject,
    options: {
      razzleOptions, // the modified options passed to Razzle in the `options` key in `razzle.config.js` (options: { key: 'value'})
      webpackOptions, // the modified options that was used to configure webpack/ webpack loaders and plugins
    },
    paths, // the modified paths that will be used by Razzle.
  }) {
    const projectRootPath = path.resolve('.');

    const jsConfig = require(`${projectRootPath}/jsconfig.json`);
    const searchlibConf = jsConfig.compilerOptions.paths.searchlib;

    if (!searchlibConf) return webpackConfig;

    // because we load @eeacms/search "through the back door" (via webpack
    // aliases and jsconfig.json), we need to instruct babel to include this
    // package as well
    const babelLoaderFinder = makeLoaderFinder('babel-loader');
    const babelLoader = webpackConfig.module.rules.find(babelLoaderFinder);
    const { include } = babelLoader;

    pkgs.forEach((name) => {
      // const incl = path.dirname(require.resolve(name));
      const incl = webpackConfig.resolve.alias[name];
      include.push(incl);
    });

    return webpackConfig;
  },
};
