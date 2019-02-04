import chalk from 'chalk';
import path from 'path';
import fromEntries from 'object.fromentries';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

import forEachProject from '../traversal/forEachProject';
import forEachDescriptor from '../traversal/forEachDescriptor';
import getProjectRootConfig from '../helpers/getProjectRootConfig';
import requireFiles from '../helpers/requireFiles';
import getComponentPaths from '../helpers/getComponentPaths';
import normalizeConfig from '../helpers/normalizeConfig';
import stripMatchingPrefix from '../helpers/stripMatchingPrefix';

export const command = 'componentPaths';
export const desc = 'print out component paths for the given project';

export { default as builder } from '../helpers/validateCommand';

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
