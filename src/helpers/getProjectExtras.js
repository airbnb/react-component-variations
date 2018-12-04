import validateProject from './validateProject';
import requirePropertyPaths from './requirePropertyPaths';

export default function getProjectExtras({
  projectConfig,
  projectRoot,
  getExtras = () => {},
}) {
  validateProject(projectConfig);

  const { extras = {}, extensions } = projectConfig;

  return {
    ...requirePropertyPaths(extras, { projectRoot, extensions }),
    ...getExtras(),
  };
}
