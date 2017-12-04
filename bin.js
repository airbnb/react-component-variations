#!/usr/bin/env node
'use strict'

const argv = require('yargs')
  /*.command('validate <paths..>', 'validate Variation Provider paths', (yargs) => {
    yargs.positional('paths', {
      describe: 'glob paths to Variation Providers',
      type: 'path'
    });
  })
*/
  .commandDir('./commands', {
  })
  .demandCommand()
  .help()
  .argv;


