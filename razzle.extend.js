const path = require('path');
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');

const pkgs = ['@eeacms/search'];
// , '@eeacms/globalsearch'

const modify = (config, { target, dev }, webpack) => {
  const projectRootPath = path.resolve('.');

//  return config;
//  const jsConfig = require(`${projectRootPath}/jsconfig.json`);
//  const searchlibConf = jsConfig.compilerOptions.paths.searchlib;
//  if (!searchlibConf) return config;

  // because we load @eeacms/search "through the back door" (via webpack
  // aliases and jsconfig.json), we need to instruct babel to include this
  // package as well
  const babelLoaderFinder = makeLoaderFinder('babel-loader');
  const babelLoader = config.module.rules.find(babelLoaderFinder);
  const { include } = babelLoader;

  pkgs.forEach((name) => {
    incl = path.dirname(require.resolve(name));
    include.push(incl)
  });
  return config;
};

module.exports = {
  plugins: (plugs) => plugs,
  modify,
};
