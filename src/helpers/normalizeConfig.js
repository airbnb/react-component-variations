'use strict';

const fs = require('fs');
const findUp = require('find-up');

module.exports = function normalizeConfig(config) {
  if (config.all) {
    const { all, project, ...rest } = config;
    return { ...rest, projectNames: Object.keys(config.projects) };
  }
  if (config.project) {
    const { project, ...rest } = config;
    return { ...rest, projectNames: [project] };
  }
  if (!config.projects) {
    const packagePath = findUp.sync('package.json', { normalize: false });
    const { name: packageName } = JSON.parse(fs.readFileSync(packagePath));
    const project = packageName || 'root';
    return {
      ...config,
      projects: {
        [project]: {
          ...config,
        },
      },
      projectNames: [project],
    };
  }

  throw new TypeError('assertion failure: should never happen');
};
