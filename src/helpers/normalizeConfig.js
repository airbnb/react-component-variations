import fs from 'fs';
import findUp from 'find-up';
import fromEntries from 'object.fromentries';
import entries from 'object.entries';

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

function normalizeRequireableBags(rootConfig, projectConfig, propertyNames) {
  return propertyNames.reduce((conf, name) => {
    if (Array.isArray(rootConfig[name])) {
      return {
        ...conf,
        [name]: normalizeConfigArrays(rootConfig, projectConfig, name),
      };
    }

    return {
      ...conf,
      [name]: {
        ...rootConfig[name],
        ...projectConfig[name],
      },
    };
  }, projectConfig);
}

function normalizeProjects(rootConfig, projects, extraData) {
  return fromEntries(entries(projects).map(([name, projectConfig]) => {
    const obj = normalizeRequireableBags(rootConfig, normalizeProjectConfig(projectConfig, extraData), [
      'extras',
      'metadata',
    ]);
    const value = {
      ...obj,
      sync: normalizeRequireableBags(rootConfig.sync || {}, projectConfig.sync || {}, ['hooks']),
    };
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
      projectNames: [project],
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
