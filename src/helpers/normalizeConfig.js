import fs from 'fs';
import findUp from 'find-up';
import fromEntries from 'object.fromentries';
import entries from 'object.entries';
import flat from 'array.prototype.flat';

import requireProperties from './requireProperties';

function normalizeProjectConfig(config, {
  extensions,
  projectRoot = process.cwd(),
  requireInteropWrapper,
} = {}) {
  const c = requireProperties(config, ['renderWrapper'], {
    extensions,
    projectRoot,
    requireInteropWrapper,
  });
  return c;
}

function normalizeConfigArrays(rootConfig, projectConfig, propertyName) {
  const set = new Set([].concat(projectConfig[propertyName] || [], rootConfig[propertyName] || []));
  return [...set];
}

function normalizeRequireableArrays(propertyNames, rootConfig = {}, projectConfig = {}) {
  return propertyNames.reduce((conf, name) => ({
    ...conf,
    [name]: normalizeConfigArrays(rootConfig, projectConfig, name),
  }), projectConfig);
}

function normalizeRequireableBags(propertyNames, rootConfig = {}, projectConfig = {}) {
  return propertyNames.reduce((conf, name) => ({
    ...conf,
    [name]: {
      ...rootConfig[name],
      ...projectConfig[name],
    },
  }), projectConfig);
}

function normalizeProjects(rootConfig, projects, extraData) {
  return fromEntries(entries(projects).map(([name, projectConfig]) => {
    const obj = normalizeRequireableBags([
      'extras',
      'metadata',
    ], rootConfig, normalizeProjectConfig(projectConfig, extraData));

    const sync = normalizeRequireableArrays([
      'hooks',
    ], rootConfig.sync, projectConfig.sync);

    const value = { ...obj, sync };
    return [name, value];
  }));
}

export default function normalizeConfig({
  all,
  /* these are provided by yargs */
  version,
  help,
  $0,
  config: __,
  _,
  /* ^ these were provided by yargs */
  ...config
}, extraData = {}) {
  if (all) {
    const { project, ...rest } = config;
    return {
      ...normalizeProjectConfig(rest, extraData),
      projects: normalizeProjects(rest, config.projects, extraData),
      projectNames: Object.keys(config.projects),
    };
  }
  if (config.project) {
    const { project, ...rest } = config;
    return {
      ...normalizeProjectConfig(rest, extraData),
      projects: normalizeProjects(config, config.projects, extraData),
      projectNames: flat([project], 1),
    };
  }
  if (!config.projects) {
    const { project: ___, projects, ...rest } = config;
    const packagePath = findUp.sync('package.json', { normalize: false });
    const { name: packageName } = JSON.parse(fs.readFileSync(packagePath));
    const project = packageName || 'root';

    return {
      ...rest,
      projects: normalizeProjects(config, {
        [project]: normalizeProjectConfig(rest, extraData),
      }, extraData),
      projectNames: [project],
    };
  }

  const { project, ...rest } = config;
  return {
    ...normalizeProjectConfig(rest),
    projectNames: Object.keys(config.projects),
    projects: normalizeProjects(config, config.projects, extraData),
  };
}
