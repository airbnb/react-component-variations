'use strict';

const resolve = require('resolve');
const fromEntries = require('object.fromentries');

const defaultExtensionKeys = Object.keys(require.extensions);
const defaultExtensions = defaultExtensionKeys.length > 0 ? defaultExtensionKeys : ['.js', '.jsx'];

module.exports = function requireFiles(arg, {
  projectRoot = process.cwd(),
  extensions = defaultExtensions,
} = {}) {
  if (arg && !Array.isArray(arg) && typeof arg === 'object') {
    return arg;
  }
  return fromEntries([].concat(arg).map(requirePath => [
    requirePath,
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(resolve.sync(requirePath, { basedir: projectRoot, extensions })),
  ]));
};
