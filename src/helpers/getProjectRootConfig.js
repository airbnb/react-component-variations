'use strict';

const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

module.exports = function getProjectRootConfig(projectRoot = process.cwd(), configPath = undefined) {
  const config = configPath
    ? JSON.parse(fs.readFileSync(path.join(projectRoot, configPath)))
    : yargs.pkgConf('react-component-variations', projectRoot).parse('');
  throw config;
};
