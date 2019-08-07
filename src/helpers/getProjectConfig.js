import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'es6-promisify';
import globToFiles from './globToFiles';

// This function is used to handle the case where react-component-variation configs
// are spread out across multiple files.
// We expect each config file to be a json file that contains configuration under the field "react-component-variations"
export default async function getProjectConfig(rootConfig) {
  const { projectConfigPath } = rootConfig;
  if (projectConfigPath) {
    // Here we look through all the project config files that match our glob
    // and then read each file and create a config object
    return Promise.all(globToFiles(projectConfigPath).map(async (file) => {
      const projectConfigFileContents = await promisify(readFile)(file);
      const config = await JSON.parse(String(projectConfigFileContents))['react-component-variations'];
      // If a name property exists on the "react-component-variations" field, use that as the project names
      // otherwise use the parent directory name by default.
      // A config file path frontend/my-project/config.json, will have the project name "my-project"
      const projectName = config.name || path.parse(file).dir.split(path.sep).pop();

      return { [projectName]: config };
    })).then(((arrayOfProjectConfigs) => {
      // Since project names are the top level properties in the projects object
      // duplicate keys will overwrite eachother. We throw if we find any duplicate project names.
      const projectNameDuplicates = arrayOfProjectConfigs
        .map(obj => Object.keys(obj)[0])
        .filter((name, index, array) => array.indexOf(name) !== index);

      if (projectNameDuplicates.length) {
        throw new TypeError(`Found duplicate project names: ${projectNameDuplicates}`);
      }

      // After parsing all config files, we return a configuration object
      // that mirrors the root configuration.
      return ({
        ...rootConfig,
        projects: arrayOfProjectConfigs.reduce((memo, projectConfig) => ({
          ...memo,
          ...projectConfig,
        }), {}),
      });
    }));
  }
  return rootConfig;
}
