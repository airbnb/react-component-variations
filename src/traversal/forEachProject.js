import validateProjects from '../helpers/validateProjects';

export default function forEachProject(projects, projectNames, callback) {
  if (!Array.isArray(projectNames) || projectNames.length === 0) {
    throw new TypeError('`projectNames` must be a non-empty array');
  }

  validateProjects(projects, projectNames);

  if (typeof callback !== 'function' || (callback.length < 1 || callback.length > 2)) {
    throw new TypeError('a callback that accepts exactly 1 or 2 arguments is required');
  }

  projectNames.forEach((project) => {
    const projectConfig = projects[project];
    callback(project, projectConfig);
  });
}
