import fromEntries from 'object.fromentries';
import entries from 'object.entries';

import validateProject from './validateProject';
import requireFile from './requireFile';

export default function getProjectExtras({
  projectConfig,
  projectRoot,
  getExtras = () => {},
}) {
  validateProject(projectConfig);

  const { extras = {}, extensions } = projectConfig;

  return {
    ...fromEntries(entries(extras).map(([key, filePath]) => ({
      [key]: requireFile(filePath, { projectRoot, extensions }),
    }))),
    ...getExtras(),
  };
}
