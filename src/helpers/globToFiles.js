'use strict';

const path = require('path');
const glob = require('glob');

module.exports = function globToFiles(arg) {
  return glob.sync(arg).map(x => path.normalize(x));
}
