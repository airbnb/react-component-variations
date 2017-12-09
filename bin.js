#!/usr/bin/env node

'use strict';

const resolve = require('resolve');

require('yargs')
  .commandDir('./commands')
  .demandCommand()
  .option('require', {
    type: 'string',
    describe: 'Optional path to require, like a shim or custom loader',
    coerce(arg) {
      [].concat(arg).forEach((path) => {
        require(resolve.sync(path, { basedir: process.cwd() }));
      });
    },
  })
  .help()
  .parse();
