import fs from 'fs';
import findUp from 'find-up';
import fromEntries from 'object.fromentries';
import entries from 'object.entries';

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
}, {
  projectRoot = process.cwd(),
} = {}) {
  if (all) {
    const { project, ...rest } = config;
    return { ...rest, projectNames: Object.keys(config.projects) };
  }
  if (config.project) {
    const { project, ...rest } = config;
    return { ...rest, projectNames: [project] };
  }
  if (!config.projects) {
    const { project: ___, projects, ...rest } = config;
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

  const { project, extras, ...rest } = config;
  return {
    ...rest,
    extras,
    projectNames: Object.keys(config.projects),
    projects: fromEntries(entries(config.projects).map(([projectName, projectConfig]) => [projectName, {
      ...projectConfig,
      extras: {
        ...projectConfig.extras,
        ...extras,
      },
    }])),
  };
}
