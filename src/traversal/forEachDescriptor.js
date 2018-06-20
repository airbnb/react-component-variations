'use strict';

const values = require('object.values');

const validateProject = require('../helpers/validateProject');
const getComponents = require('../helpers/getComponents');
const getVariations = require('../helpers/getVariations');
const getDescriptorFromProvider = require('../helpers/getDescriptorFromProvider');

module.exports = function forEachDescriptor(
  projectConfig,
  {
    getExtras = () => {},
    getDescriptor = getDescriptorFromProvider,
  } = {},
) {
  validateProject(projectConfig);

  if (typeof getDescriptorFromProvider !== 'function' && (getDescriptorFromProvider.length < 1 || getDescriptorFromProvider.length > 2)) {
    throw new TypeError('`getDescriptor` must be a function that accepts exactly 1 or 2 arguments');
  }

  const Components = getComponents(projectConfig.components);
  const variations = getVariations(projectConfig.variations);

  return function traverseVariationDescriptors(callback) {
    if (typeof callback !== 'function' && callback.length !== 1) {
      throw new TypeError('a callback that accepts exactly 1 argument is required');
    }
    values(variations).forEach((provider) => {
      const descriptor = getDescriptor(provider, { Components, variations, getExtras });
      callback(descriptor);
    });
  };
};
