'use strict';

const isValidProjectName = require('./isValidProjectName');
const validateProject = require('./validateProject');

module.exports = function validateProjects(projects, projectNames, extraMsg = '') {
  const areProjectNamesValid = projectNames.every(x => isValidProjectName(projects, x));
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
};
