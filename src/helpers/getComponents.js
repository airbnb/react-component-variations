'use strict';

const validateProject = require('./validateProject');
const globToFiles = require('./globToFiles');
const requireFiles = require('./requireFiles');

module.exports = function getComponents(projectConfig, projectRoot) {
  validateProject(projectConfig);

  const { components, extensions } = projectConfig;
  return requireFiles(globToFiles(components), { projectRoot, extensions });
};
