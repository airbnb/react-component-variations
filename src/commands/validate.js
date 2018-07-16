import chalk from 'chalk';
import has from 'has';

import getValidationErrors from '../helpers/getValidationErrors';
import globToFiles from '../helpers/globToFiles';
import requireFiles from '../helpers/requireFiles';
import forEachProject from '../traversal/forEachProject';
import validateProjects from '../helpers/validateProjects';
import validateProject from '../helpers/validateProject';
import normalizeConfig from '../helpers/normalizeConfig';

function getOverallErrors({
  variations = [],
  components = [],
  log,
  warn,
  error,
  projectConfig,
  projectRoot,
}) {
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

  const errors = getValidationErrors(variations, {
    projectConfig,
    projectRoot,
  });

  if (errors.length > 0) {
    errors.forEach((e) => { warn(e); });
    return errors.length;
  }
  log(chalk.green(`${chalk.bold('Success!')} All Variation Providers appear to be valid.`));
  return 0;
}

export const command = 'validate [variations]';
export const desc = 'validate Variation Providers';
export const builder = (yargs) => {
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

export const handler = (config) => {
  const { projects, projectNames } = normalizeConfig(config);

  const exitCodes = [];

  forEachProject(projects, projectNames, (project, projectConfig) => {
    const {
      variations,
      components,
      require: requires,
    } = projectConfig;
    if (requires) { requireFiles(requires); }
    // the purpose of the try/catch here is so that when an error is encountered, we can continue showing useful output rather than terminating the process.
    try {
      const exitCode = getOverallErrors({
        variations: globToFiles(variations),
        components: globToFiles(components),
        log: x => console.log(`${chalk.inverse(chalk.blue(`Project “${project}”`))}: ${x}`),
        warn: x => console.warn(`${chalk.inverse(chalk.yellow(`Project “${project}”`))}: ${x}`),
        error: x => console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${x}`),
        projectConfig,
      });
      exitCodes.push(exitCode);
    } catch (e) {
      console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${e.message}`);
      exitCodes.push(1); // however, we don't want to exit 0 later if anything has errored
    }
  });

  process.exit(Math.max(...exitCodes));
};
