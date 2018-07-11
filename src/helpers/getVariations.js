import validateProject from './validateProject';
import globToFiles from './globToFiles';
import requireFiles from './requireFiles';

export default function getVariations(projectConfig, projectRoot) {
  validateProject(projectConfig);

  const { variations, extensions } = projectConfig;
  return requireFiles(globToFiles(variations), { projectRoot, extensions });
}
