'use strict';

const validateProject = require('./validateProject');
const globToFiles = require('./globToFiles');
const requireFiles = require('./requireFiles');

module.exports = function getComponents(projectConfig) {
  validateProject(projectConfig);

  const { components } = projectConfig;
  return requireFiles(globToFiles(components));
};
