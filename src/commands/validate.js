'use strict';

const chalk = require('chalk');
const has = require('has');

const getValidationErrors = require('../helpers/getValidationErrors');
const globToFiles = require('../helpers/globToFiles');
const requireFiles = require('../helpers/requireFiles');
const forEachProject = require('../traversal/forEachProject');
const validateProjects = require('../helpers/validateProjects');
const validateProject = require('../helpers/validateProject');
const normalizeConfig = require('../helpers/normalizeConfig');

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
  const config = normalizeConfig(yargs.argv);
  const { project, projects, all } = config;
  const allProjectNames = projects ? Object.keys(projects) : [];

  if (all && allProjectNames.length <= 0) {
    throw chalk.red('`--all` requires a non-empty “projects” config');
  }
  if (all && project) {
    throw chalk.red('`--all` and `--project` are mutually exclusive');
  }
  if (project && !has(projects, project)) {
    throw chalk.red(`Project "${project}" missing from “projects” config`);
  }

  if (projects) {
    validateProjects(projects, allProjectNames, 'in the “projects” config');
  } else {
    validateProject(config);
  }
};

exports.handler = (config) => {
  const { projects, projectNames } = normalizeConfig(config);

  const exitCodes = [];

  forEachProject(projects, projectNames, (project, {
    variations,
    components,
    require: requires,
  }) => {
    if (requires) { requireFiles(requires); }
    // the purpose of the try/catch here is so that when an error is encountered, we can continue showing useful output rather than terminating the process.
    try {
      const exitCode = getOverallErrors(
        globToFiles(variations),
        globToFiles(components),
        x => console.log(`${chalk.inverse(chalk.blue(`Project “${project}”`))}: ${x}`),
        x => console.warn(`${chalk.inverse(chalk.yellow(`Project “${project}”`))}: ${x}`),
        x => console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${x}`),
      );
      exitCodes.push(exitCode);
    } catch (e) {
      console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${e.message}`);
      exitCodes.push(1); // however, we don't want to exit 0 later if anything has errored
    }
  });

  process.exit(Math.max(...exitCodes));
};
