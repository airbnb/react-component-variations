import getProjectRootConfig from '../helpers/getProjectRootConfig';
import validateProjects from '../helpers/validateProjects';

import forEachVariation from './forEachVariation';
import forEachProject from './forEachProject';
import forEachDescriptor from './forEachDescriptor';

export default function forEachProjectVariation(consumer, {
  projectRoot = process.cwd(),
  selectProjectNames = x => x,
  getDescriptor = undefined,
  getExtras = undefined,
} = {}) {
  const { projects } = getProjectRootConfig(projectRoot); // adds 1 "projects" and "project" of package.json name, normalizes each project config and merges down

  const allProjectNames = Object.keys(projects);
  const filteredProjectNames = [].concat(selectProjectNames(allProjectNames));

  validateProjects(projects, filteredProjectNames, 'returned from `selectProjectNames`');

  return function traverseVariations(callback) {
    if (typeof callback !== 'function' && callback.length !== 1) {
      throw new TypeError('a callback that accepts exactly 1 argument is required');
    }

    forEachProject(projects, filteredProjectNames, (projectName, projectConfig) => {
      forEachDescriptor(
        projectConfig,
        { getExtras, getDescriptor, projectRoot },
      )((descriptor) => {
        forEachVariation(descriptor, consumer, callback);
      });
    });
  };
}
