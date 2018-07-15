import values from 'object.values';
import has from 'has';

import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';
import addComponentAliases from './addComponentAliases';

function stripRoot(path, projectRoot) {
  return path.startsWith(projectRoot) ? `./${path.slice(projectRoot.length + 1)}` : path;
}

export default function getComponents(projectConfig, projectRoot) {
  validateProject(projectConfig);

  const {
    components,
    extensions,
    flattenComponentTree,
  } = projectConfig;
  const fileMap = requireFiles(globToFiles(components), { projectRoot, extensions });

  return values(fileMap).reduce((
    Components,
    { actualPath, Module },
  ) => addComponentAliases(
    Components,
    stripRoot(actualPath, projectRoot),
    has(Module, 'default') ? Module.default : Module,
    flattenComponentTree,
  ), {});
}
