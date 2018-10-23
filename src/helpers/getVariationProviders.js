import entries from 'object.entries';
import fromEntries from 'object.fromentries';
import path from 'path';

import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';
import getDefaultOrModule from './getDefaultOrModule';

export default function getVariationProviders(projectConfig, projectRoot, {
  fileMapOnly = false,
} = {}) {
  validateProject(projectConfig);

  const {
    variations,
    variationsRoot,
    extensions,
    requireInteropWrapper,
  } = projectConfig;
  const actualRoot = variationsRoot ? path.join(projectRoot, variationsRoot) : projectRoot;
  const files = globToFiles(variations, actualRoot);
  const fileMap = requireFiles(files, {
    projectRoot: actualRoot,
    extensions,
    requireInteropWrapper,
  });

  if (fileMapOnly) {
    return fileMap;
  }

  return fromEntries(entries(fileMap).map(([requirePath, { Module }]) => [
    requirePath,
    getDefaultOrModule(Module),
  ]));
}
