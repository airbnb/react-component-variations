'use strict';

const validateProject = require('./validateProject');
const globToFiles = require('./globToFiles');
const requireFiles = require('./requireFiles');

module.exports = function getVariations(projectConfig) {
  validateProject(projectConfig);

  const { variations } = projectConfig;
  return requireFiles(globToFiles(variations));
};
