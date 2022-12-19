const path = require('path');
const makeLoaderFinder = require('razzle-dev-utils/makeLoaderFinder');

const modify = (config, { target, dev }, webpack) => {
  const voltoSearchlibPath = path.dirname(
    require.resolve('@eeacms/volto-searchlib'),
  );
  const searchlibPath = path.resolve(`${voltoSearchlibPath}/../searchlib`);

  // because we load @eeacms/search "through the back door" , we need to
  // instruct babel to include this package as well
  const babelLoaderFinder = makeLoaderFinder('babel-loader');
  const babelLoader = config.module.rules.find(babelLoaderFinder);
  const { include } = babelLoader;

  config.resolve.alias['@eeacms/search'] = searchlibPath;
  include.push(searchlibPath);

  if (config.devServer) {
    config.devServer.watchOptions.ignored = /node_modules\/(?!(@plone\/volto|@elastic))/g;
  }

  return config;
};

module.exports = {
  plugins: (plugs) => plugs,
  modify,
};
