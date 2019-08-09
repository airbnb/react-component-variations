#!/usr/bin/env node
import requireFiles from './helpers/requireFiles';
import globToFiles from './helpers/globToFiles';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';
import os from 'os';

require('yargs')
  .commandDir('./commands')
  .demandCommand(1, 'a subcommand is required')
  .option('project', {
    type: 'string',
    describe: 'project name',
    implies: 'projects',
  })
  .option('all', {
    type: 'boolean',
    default: undefined, // necessary because "conflicts" is stupid with booleans
    describe: 'include all projects',
    implies: 'projects',
  })
  .conflicts('all', 'project')
  .conflicts('project', 'all')
  .option('projects', {
    describe: 'Object mapping project names to project configs',
    hidden: true,
  })
  .option('require', {
    type: 'string',
    describe: 'Optional path(s) to require, like a shim or custom loader',
    coerce: (x) => { requireFiles(x); return x; },
  })
  .option('components', {
    type: 'string',
    describe: 'glob path to React components',
    coerce: globToFiles,
  })
  .option('variations', {
    type: 'string',
    describe: 'glob path to Variation Providers',
    coerce: globToFiles,
  })
  .config('config', (configPath) => {
    if(existsSync(configPath)) {
      const config = require(configPath);
      const tmpFile = path.join(os.tmpdir(),  path.parse(configPath).base);
      writeFileSync(tmpFile, JSON.stringify(config));
      return JSON.parse(readFileSync(tmpFile));
    } else {
      return yargs.pkgConf()['react-component-variations'];
    }
  })
  .describe('config', 'Config file path')
  .default('config', '.react-component-variations.js')
  .parse();
