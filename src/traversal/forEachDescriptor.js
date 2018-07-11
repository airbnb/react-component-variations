import values from 'object.values';

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

  if (typeof getDescriptorFromProvider !== 'function' && (getDescriptorFromProvider.length < 1 || getDescriptorFromProvider.length > 2)) {
    throw new TypeError('`getDescriptor` must be a function that accepts exactly 1 or 2 arguments');
  }

  const Components = getComponents(projectConfig, projectRoot);
  const variations = getVariations(projectConfig, projectRoot);

  return function traverseVariationDescriptors(callback) {
    if (typeof callback !== 'function' && callback.length !== 1) {
      throw new TypeError('a callback that accepts exactly 1 argument is required');
    }
    values(variations).forEach((provider) => {
      const descriptor = getDescriptor(provider, { Components, variations, getExtras });
      callback(descriptor);
    });
  };
}
