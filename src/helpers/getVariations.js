import entries from 'object.entries';
import fromEntries from 'object.fromentries';
import has from 'has';

import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';

export default function getVariations(projectConfig, projectRoot) {
  validateProject(projectConfig);

  const { variations, extensions } = projectConfig;
  const fileMap = requireFiles(globToFiles(variations), { projectRoot, extensions });

  return fromEntries(entries(fileMap).map(([requirePath, { Module }]) => [
    requirePath,
    has(Module, 'default') ? Module.default : Module,
  ]));
}
