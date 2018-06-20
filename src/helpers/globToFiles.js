'use strict';

const path = require('path');
const glob = require('glob');

module.exports = function globToFiles(arg) {
  if (Array.isArray(arg)) {
    return arg;
  }
  return glob.sync(arg).map(x => path.normalize(x));
};
