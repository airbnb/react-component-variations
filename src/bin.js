#!/usr/bin/env node

'use strict';

const resolve = require('resolve');
const glob = require('glob');
const path = require('path');

require('yargs')
  .commandDir('./commands')
  .demandCommand(1, 'a subcommand is required')
  .option('project', {
    type: 'string',
    describe: 'project name',
    implies: 'projects',
  })
  .option('projects', {
    describe: 'Object mapping project names to project configs',
    implies: 'project',
    hidden: true,
  })
  .option('require', {
    type: 'string',
    describe: 'Optional path(s) to require, like a shim or custom loader',
    coerce(arg) {
      [].concat(arg).forEach((requirePath) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(resolve.sync(requirePath, { basedir: process.cwd() }));
      });
    },
  })
  .option('components', {
    type: 'string',
    describe: 'glob path to React components',
    demandOption: true,
    requiresArg: true,
    coerce(arg) {
      return glob.sync(arg).map(x => path.normalize(x));
    },
  })
  .option('variations', {
    type: 'string',
    describe: 'glob path to Variation Providers',
    demandOption: true,
    requiresArg: true,
    coerce(arg) {
      return glob.sync(arg).map(x => path.normalize(x));
    },
  })
  .config()
  .pkgConf('react-component-variations')
  .help()
  .parse();
