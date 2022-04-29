const path = require('path');
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');

const pkgs = ['@eeacms/search'];
// , '@eeacms/globalsearch'

const modify = (config, { target, dev }, webpack) => {
  const projectRootPath = path.resolve('.');
  const jsConfig = require(`${projectRootPath}/jsconfig.json`);
  const searchlibConf = jsConfig.compilerOptions.paths.searchlib;
  if (!searchlibConf) return config;

  const babelLoaderFinder = makeLoaderFinder('babel-loader');
  const babelLoader = config.module.rules.find(babelLoaderFinder);
  const { include } = babelLoader;

  pkgs.forEach((name) => {
    include.push(config.resolve.alias[name]);
  });

  return config;
};

module.exports = {
  plugins: (plugs) => plugs,
  modify,
};
