import entries from 'object.entries';
import fromEntries from 'object.fromentries';
import has from 'has';
import path from 'path';

import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';

export default function getVariationProviders(projectConfig, projectRoot, {
  fileMapOnly = false,
} = {}) {
  validateProject(projectConfig);

  const {
    variations,
    variationsRoot,
    extensions,
  } = projectConfig;
  const actualRoot = variationsRoot ? path.join(projectRoot, variationsRoot) : projectRoot;
  const files = globToFiles(variations, actualRoot);
  const fileMap = requireFiles(files, { projectRoot: actualRoot, extensions });

  if (fileMapOnly) {
    return fileMap;
  }

  return fromEntries(entries(fileMap).map(([requirePath, { Module }]) => [
    requirePath,
    has(Module, 'default') ? Module.default : Module,
  ]));
}
