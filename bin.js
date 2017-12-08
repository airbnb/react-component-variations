#!/usr/bin/env node

'use strict';

require('yargs')
  .commandDir('./commands')
  .demandCommand()
  .help()
  .parse();
