import has from 'has';

export default function isValidProjectName(projects, project) {
  return typeof project === 'string' && project.length > 0 && has(projects, project);
}
