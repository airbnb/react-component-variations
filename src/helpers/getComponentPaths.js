import flatMap from 'array.prototype.flatmap';
import find from 'array.prototype.find';
import entries from 'object.entries';

import getComponents from './getComponents';
import getDefaultOrModule from './getDefaultOrModule';

export default function getComponentPaths(projectConfig, projectRoot, Component) {
  const fileMap = getComponents(projectConfig, projectRoot, { fileMapOnly: true });

  const found = flatMap(entries(fileMap), ([requirePath, { Module, actualPath }]) => {
    if (Component === getDefaultOrModule(Module)) {
      const { componentsRoot } = projectConfig;
      return {
        actualPath,
        requirePath,
        projectRoot,
        ...(componentsRoot && { componentsRoot }),
      };
    }
    return [];
  });
  return find(found, Boolean);
}
