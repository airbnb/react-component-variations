'use strict';

const chalk = require('chalk');
const has = require('has');

const getValidationErrors = require('../helpers/getValidationErrors');

exports.command = 'validate [variations]';
exports.desc = 'validate Variation Providers';
exports.builder = (yargs) => {
  yargs.demandOption('variations'); // this must come after config/pkgConf, so it can be supplied that way.
  yargs.positional('variations', {});

  const { project, projects } = yargs.argv;
  if (project && !has(projects, project)) {
    throw chalk.red(`Project "${project}" missing from projects config`);
  }
  if (project) {
    yargs.config(projects[project]);
  }
};
exports.handler = (argv) => {
  if (argv.variations.length === 0) {
    console.error(chalk.red(chalk.bold('No Variation Providers found.')));
    process.exit(1);
  }

  if (argv.components.length === 0) {
    console.error(chalk.red(chalk.bold('No Components found.')));
    process.exit(2);
  }

  console.log(chalk.blue(`${chalk.bold(argv.components.length)} Components found...`));
  console.log(chalk.green(`${chalk.bold(argv.variations.length)} Variation Providers found...`));

  if (argv.components.length < argv.variations.length) {
    console.error(chalk.red(chalk.bold('Found fewer Components than Variation Providers.')));
    process.exit(3);
  }

  const errors = getValidationErrors(argv.variations);

  if (errors.length > 0) {
    errors.forEach((error) => { console.warn(error); });
    process.exit(errors.length);
  }
  console.log(chalk.green(`${chalk.bold('Success!')} All Variation Providers appear to be valid.`));
};
