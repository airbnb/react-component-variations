import isValidProjectName from './isValidProjectName';
import validateProject from './validateProject';

export default function validateProjects(projects, projectNames, extraMsg = '') {
  const areProjectNamesValid = Array.isArray(projectNames)
    && projectNames.length > 0
    && projectNames.every(x => isValidProjectName(projects, x));

  if (!areProjectNamesValid) {
    throw new TypeError(`All project names ${extraMsg ? `${extraMsg} ` : ''}must be strings, and present in the “projects” config.
  Existing projects:
    - ${Object.keys(projects).join('\n    - ')}
`);
  }

  projectNames.forEach((project) => {
    const projectConfig = projects[project];
    validateProject(projectConfig);
  });
}
