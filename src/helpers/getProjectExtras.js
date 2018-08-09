import fromEntries from 'object.fromentries';
import entries from 'object.entries';

import validateProject from './validateProject';
import requireFile from './requireFile';
import getDefaultOrModule from './getDefaultOrModule';

export default function getProjectExtras({
  projectConfig,
  projectRoot,
  getExtras = () => {},
}) {
  validateProject(projectConfig);

  const { extras = {}, extensions } = projectConfig;

  const projectExtraEntries = entries(extras).map(([key, filePath]) => {
    const { Module } = requireFile(filePath, { projectRoot, extensions });
    return [key, getDefaultOrModule(Module)];
  });

  return {
    ...fromEntries(projectExtraEntries),
    ...getExtras(),
  };
}
