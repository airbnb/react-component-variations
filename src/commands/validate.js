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
  const { project, projects, all } = yargs.argv;
  const projectCount = projects ? Object.keys(projects).length : 0;

  if (!all) {
    // this must come after config/pkgConf, so it can be supplied that way.
    yargs.option('variations', {
      demandOption: true,
      requiresArg: true,
    });
    yargs.option('components', {
      demandOption: true,
      requiresArg: true,
    });
  }
  yargs.positional('variations', {});

  if (all && projectCount <= 0) {
    throw chalk.red(`\`--all\` requires a non-empty “projects” config`);
  }
  if (all && project) {
    throw chalk.red(`\`--all\` and \`--project\` are mutually exclusive`);
  }
  if (project && !has(projects, project)) {
    throw chalk.red(`Project "${project}" missing from “projects” config`);
  }
  if (project) {
    yargs.config(projects[project]);
  }
};
exports.handler = ({ variations, components, all, projects }) => {
  if (all) {
    const exitCodes = Object.entries(projects).map(([
      project,
      { variations, components, require: requires },
    ]) => {
      if (requires) { requireFiles(requires); }
      try {
        return getOverallErrors(
          globToFiles(variations),
          globToFiles(components),
          x => console.log(`${chalk.inverse(chalk.blue(`Project “${project}”`))}: ${x}`),
          x => console.warn(`${chalk.inverse(chalk.yellow(`Project “${project}”`))}: ${x}`),
          x => console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${x}`),
        );
      } catch (e) {
        console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${e.message}`);
        return 1;
      }
    });
    process.exit(Math.max(...exitCodes));
  }

  const exitCode = getOverallErrors(
    variations,
    components,
    x => console.log(x),
    x => console.warn(x),
    x => console.error(x),
  );
  process.exit(exitCode);
};
