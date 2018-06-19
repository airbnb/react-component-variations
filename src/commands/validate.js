'use strict';

const chalk = require('chalk');
const has = require('has');
const yargs = require('yargs');

const getValidationErrors = require('../helpers/getValidationErrors');
const globToFiles = require('../helpers/globToFiles');
const requireFiles = require('../helpers/requireFiles');

function getOverallErrors(variations = [], components = [], log, warn, error) {
  if (variations.length === 0) {
    error(chalk.red(chalk.bold('No Variation Providers found.')));
    return 1;
  }

  if (components.length === 0) {
    error(chalk.red(chalk.bold('No Components found.')));
    return 1;
  }

  log(chalk.blue(`${chalk.bold(components.length)} Components found...`));
  log(chalk.green(`${chalk.bold(variations.length)} Variation Providers found...`));

  if (components.length < variations.length) {
    error(chalk.red(chalk.bold('Found fewer Components than Variation Providers.')));
    return 1;
  }

  const errors = getValidationErrors(variations);

  if (errors.length > 0) {
    errors.forEach((e) => { warn(e); });
    return errors.length;
  }
  log(chalk.green(`${chalk.bold('Success!')} All Variation Providers appear to be valid.`));
  return 0;
}

exports.command = 'validate [variations]';
exports.desc = 'validate Variation Providers';
exports.builder = (yargs) => {
  yargs.demandOption('variations'); // this must come after config/pkgConf, so it can be supplied that way.
  yargs.positional('variations', {});

  const { project, projects } = yargs.argv;
  if (project && !has(projects, project)) {
    throw chalk.red(`Project "${project}" missing from “projects” config`);
  }
  if (project) {
    yargs.config(projects[project]);
  }
};
exports.handler = ({ variations, components }) => {
  const exitCode = getOverallErrors(
    variations,
    components,
    x => console.log(x),
    x => console.warn(x),
    x => console.error(x),
  );
  process.exit(exitCode);
};
