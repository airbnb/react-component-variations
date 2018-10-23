import chalk from 'chalk';
import path from 'path';
import fromEntries from 'object.fromentries';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';
import has from 'has';

import forEachProject from '../traversal/forEachProject';
import forEachDescriptor from '../traversal/forEachDescriptor';
import getProjectRootConfig from '../helpers/getProjectRootConfig';
import requireFiles from '../helpers/requireFiles';
import getComponentPaths from '../helpers/getComponentPaths';
import normalizeConfig from '../helpers/normalizeConfig';
import validateProjects from '../helpers/validateProjects';
import validateProject from '../helpers/validateProject';
import stripMatchingPrefix from '../helpers/stripMatchingPrefix';

export const command = 'componentPaths';
export const desc = 'print out component paths for the given project';

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
  const projectRoot = process.cwd();
  const { projectNames } = normalizeConfig(config);
  const {
    projects,
    require: requires,
    requireInteropWrapper,
  } = getProjectRootConfig(projectRoot);

  if (requires) { requireFiles(requires, { requireInteropWrapper }); }

  forEachProject(projects, projectNames, (projectName, projectConfig) => {
    const { variationsRoot } = projectConfig;
    const actualVariationRoot = variationsRoot ? path.join(projectRoot, variationsRoot) : projectRoot;

    console.log(`${chalk.inverse(chalk.blue(`Project “${projectName}”`))}:`);

    forEachDescriptor(projectConfig)((descriptor, { variationProvider }) => {
      const Components = [].concat(descriptor.component);
      const pathMap = fromEntries(Components.map(x => [getComponentName(x), getComponentPaths(projectConfig, projectRoot, x)]));
      console.log(
        chalk.bold(`${stripMatchingPrefix(actualVariationRoot, variationProvider.resolvedPath)}:`),
        JSON.stringify(pathMap, null, 2),
      );
    });
  });

  process.exit();
};
