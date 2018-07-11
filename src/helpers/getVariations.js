'use strict';

const validateProject = require('./validateProject');
const globToFiles = require('./globToFiles');
const requireFiles = require('./requireFiles');

module.exports = function getVariations(projectConfig, projectRoot) {
  validateProject(projectConfig);

  const { variations, extensions } = projectConfig;
  return requireFiles(globToFiles(variations), { projectRoot, extensions });
};
