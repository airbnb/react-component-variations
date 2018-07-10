'use strict';

const fs = require('fs');
const findUp = require('find-up');

module.exports = function normalizeConfig({
  all,
  /* these are provided by yargs */
  version,
  help,
  $0,
  config: __,
  _,
  /* ^ these were provided by yargs */
  ...config
}) {
  if (all) {
    const { project, ...rest } = config;
    return { ...rest, projectNames: Object.keys(config.projects) };
  }
  if (config.project) {
    const { project, ...rest } = config;
    return { ...rest, projectNames: [project] };
  }
  if (!config.projects) {
    const { project: ___, projects: __, ...rest } = config;
    const packagePath = findUp.sync('package.json', { normalize: false });
    const { name: packageName } = JSON.parse(fs.readFileSync(packagePath));
    const project = packageName || 'root';
    return {
      ...rest,
      projects: {
        [project]: {
          ...rest,
        },
      },
      projectNames: [project],
    };
  }

  throw new TypeError('assertion failure: should never happen');
};
