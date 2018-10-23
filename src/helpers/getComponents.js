import values from 'object.values';
import path from 'path';

import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';
import addComponentAliases from './addComponentAliases';
import getDefaultOrModule from './getDefaultOrModule';

function stripRoot(filePath, projectRoot) {
  return filePath.startsWith(projectRoot)
    ? filePath.slice(projectRoot.length).replace(/^\/?/, './')
    : filePath;
}

export default function getComponents(projectConfig, projectRoot, {
  fileMapOnly = false,
} = {}) {
  validateProject(projectConfig);

  const {
    components,
    componentsRoot,
    extensions,
    flattenComponentTree,
    requireInteropWrapper,
  } = projectConfig;
  const actualRoot = componentsRoot ? path.join(projectRoot, componentsRoot) : projectRoot;
  const files = globToFiles(components, actualRoot);
  const fileMap = requireFiles(files, {
    projectRoot: actualRoot,
    extensions,
    requireInteropWrapper,
  });

  if (fileMapOnly) {
    return fileMap;
  }

  return values(fileMap).reduce((
    Components,
    { actualPath, Module },
  ) => addComponentAliases(
    Components,
    stripRoot(actualPath, actualRoot),
    getDefaultOrModule(Module),
    flattenComponentTree,
  ), {});
}
