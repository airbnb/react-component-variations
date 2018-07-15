import entries from 'object.entries';

import validateProject from '../helpers/validateProject';
import getComponents from '../helpers/getComponents';
import getVariations from '../helpers/getVariations';
import getDescriptorFromProvider from '../helpers/getDescriptorFromProvider';

export default function forEachDescriptor(
  projectConfig,
  {
    getExtras = () => {},
    getDescriptor = getDescriptorFromProvider,
    projectRoot = process.cwd(),
  } = {},
) {
  validateProject(projectConfig);

  if (typeof getDescriptor !== 'function' || (getDescriptor.length < 1 || getDescriptor.length > 2)) {
    throw new TypeError('`getDescriptor` must be a function that accepts exactly 1 or 2 arguments');
  }

  const Components = getComponents(projectConfig, projectRoot);
  const variations = getVariations(projectConfig, projectRoot);

  if (Object.keys(Components).length === 0) {
    throw new RangeError('Zero components found');
  }
  if (Object.keys(variations).length === 0) {
    throw new RangeError('Zero variations found');
  }

  return function traverseVariationDescriptors(callback) {
    if (typeof callback !== 'function' || callback.length !== 1) {
      throw new TypeError('a callback that accepts exactly 1 argument is required');
    }
    entries(variations).forEach(([path, provider]) => {
      if (typeof provider !== 'function') {
        throw new TypeError(`“${path}” does not export default a function; got ${typeof provider}`);
      }
      const descriptor = getDescriptor(provider, { Components, variations, getExtras });
      callback(descriptor);
    });
  };
}
