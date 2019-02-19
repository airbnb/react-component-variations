import chalk from 'chalk';
import normalizeConfig from '../helpers/normalizeConfig';
import forEachProject from '../traversal/forEachProject';

import runSyncModules from '../helpers/runSyncModules';
import requireFiles from '../helpers/requireFiles';

export { default as builder } from '../helpers/validateCommand';
export const desc = 'Sync variation consumers.';
export const command = 'sync';

export const handler = (config) => {
  const { sync, projectNames, projects } = normalizeConfig(config);

  forEachProject(projects, projectNames, (projectName, projectConfig) => {
    const {
      require: requires,
      requireInteropWrapper,
    } = projectConfig;

    if (requires) {
      requireFiles(requires, { requireInteropWrapper });
    }

    runSyncModules({ projectName, sync, projectConfig }).catch((err) => {
      console.error(chalk.red(err));
      process.exit(1);
    });
  });
};
