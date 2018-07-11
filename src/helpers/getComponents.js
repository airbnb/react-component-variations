import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';

export default function getComponents(projectConfig, projectRoot) {
  validateProject(projectConfig);

  const { components, extensions } = projectConfig;
  return requireFiles(globToFiles(components), { projectRoot, extensions });
}
