import values from 'object.values';
import has from 'has';
import path from 'path';

import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';
import addComponentAliases from './addComponentAliases';

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
  } = projectConfig;
  const actualComponentRoot = componentsRoot ? path.join(projectRoot, componentsRoot) : projectRoot;
  const files = globToFiles(components, actualComponentRoot);
  const fileMap = requireFiles(files, { projectRoot: actualComponentRoot, extensions });

  if (fileMapOnly) {
    return fileMap;
  }

  return values(fileMap).reduce((
    Components,
    { actualPath, Module },
  ) => addComponentAliases(
    Components,
    stripRoot(actualPath, actualComponentRoot),
    has(Module, 'default') ? Module.default : Module,
    flattenComponentTree,
  ), {});
}
