import chalk from 'chalk';

import getComponents from '../helpers/getComponents';
import getVariationProviders from '../helpers/getVariationProviders';
import getValidationErrors from '../helpers/getValidationErrors';
import requireFiles from '../helpers/requireFiles';
import forEachProject from '../traversal/forEachProject';
import normalizeConfig from '../helpers/normalizeConfig';


function getOverallErrors({
  variations = {},
  components = {},
  log,
  warn,
  error,
  projectConfig,
  projectRoot,
}) {
  const variationCount = Object.keys(variations).length;
  if (variationCount === 0) {
    error(chalk.red(chalk.bold('No Variation Providers found.')));
    return 1;
  }

  const componentCount = Object.keys(components).length;
  if (componentCount === 0) {
    error(chalk.red(chalk.bold('No Components found.')));
    return 1;
  }

  log(chalk.blue(`${chalk.bold(componentCount)} Components found...`));
  log(chalk.green(`${chalk.bold(variationCount)} Variation Providers found...`));

  if (componentCount < variationCount) {
    error(chalk.red(chalk.bold('Found fewer Components than Variation Providers.')));
    return 1;
  }

  const errors = getValidationErrors(variations, {
    componentMap: components,
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
export { default as builder } from '../helpers/validateCommand';

export const handler = (config) => {
  const projectRoot = process.cwd();
  const { projects, projectNames } = normalizeConfig(config, { projectRoot });

  const exitCodes = [];

  forEachProject(projects, projectNames, (project, projectConfig) => {
    const {
      require: requires,
      requireInteropWrapper,
    } = projectConfig;
    const log = x => console.log(`${chalk.inverse(chalk.blue(`Project “${project}”`))}: ${x}`);
    log(chalk.yellow('validating...'));

    if (requires) { requireFiles(requires, { requireInteropWrapper }); }
    // the purpose of the try/catch here is so that when an error is encountered, we can continue showing useful output rather than terminating the process.
    try {
      const exitCode = getOverallErrors({
        variations: getVariationProviders(projectConfig, projectRoot, { fileMapOnly: true }),
        components: getComponents(projectConfig, projectRoot, { fileMapOnly: true }),
        log,
        warn: x => console.warn(`${chalk.inverse(chalk.yellow(`Project “${project}”`))}: ${x}`),
        error: x => console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${x}`),
        projectConfig,
        projectRoot,
      });
      exitCodes.push(exitCode);
    } catch (e) {
      console.error(`${chalk.inverse(chalk.red(`Project “${project}”`))}: ${e.message}`);
      exitCodes.push(1); // however, we don't want to exit 0 later if anything has errored
    }
  });

  process.exit(Math.max(...exitCodes));
};
