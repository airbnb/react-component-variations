'use strict';

const resolve = require('resolve');
const fromEntries = require('object.fromentries');

module.exports = function requireFiles(arg) {
  if (arg && !Array.isArray(arg) && typeof arg === 'object') {
    return arg;
  }
  return fromEntries([].concat(arg).map(requirePath => [
    requirePath,
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(resolve.sync(requirePath, { basedir: process.cwd() })),
  ]));
};
