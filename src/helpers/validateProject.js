'use strict';

const { validate } = require('jsonschema');
const projectSchema = require('../projectConfig');

module.exports = function validateProject(projectConfig) {
  const { errors } = validate(projectConfig, projectSchema);
  if (errors.length > 0) {
    throw new SyntaxError(`invalid project config:\n   - ${errors.join('\n   - ')}`);
  }
};
