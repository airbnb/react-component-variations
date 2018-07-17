import fromEntries from 'object.fromentries';
import entries from 'object.entries';
import has from 'has';

import validateProject from './validateProject';
import requireFile from './requireFile';

export default function getProjectExtras({
  projectConfig,
  projectRoot,
  getExtras = () => {},
}) {
  validateProject(projectConfig);

  const { extras = {}, extensions } = projectConfig;

  const projectExtraEntries = entries(extras).map(([key, filePath]) => {
    const { Module } = requireFile(filePath, { projectRoot, extensions });
    return [key, has(Module, 'default') ? Module.default : Module];
  });

  return {
    ...fromEntries(projectExtraEntries),
    ...getExtras(),
  };
}
