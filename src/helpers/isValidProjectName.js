'use strict';

const has = require('has');

module.exports = function isValidProjectName(projects, project) {
  return typeof project === 'string' && project.length > 0 && has(projects, project);
};
