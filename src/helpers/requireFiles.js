'use strict';

const resolve = require('resolve');

module.exports = function requireFiles(arg) {
  [].concat(arg).forEach((requirePath) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(resolve.sync(requirePath, { basedir: process.cwd() }));
  });
};
