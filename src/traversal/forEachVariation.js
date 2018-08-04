import entries from 'object.entries';
import getComponentName from 'airbnb-prop-types/build/helpers/getComponentName';

export default function forEachVariation(descriptor, consumer, callback) {
  if (typeof callback !== 'function' || callback.length !== 1) {
    throw new TypeError('a callback that accepts exactly 1 argument is required');
  }

  const {
    component,
    projectName,
    createdAt: rootCreatedAt,
    usage,
    options: allRootConsumerOptions = {},
    metadata = {},
    variations,
  } = descriptor;

  const { [consumer]: rootConsumerOptions = {} } = allRootConsumerOptions || {};

  // this consumer is disabled
  if (!rootConsumerOptions || rootConsumerOptions.disabled) { return; }

  const rootOptions = entries(allRootConsumerOptions).reduce((acc, [consumerName, opts]) => ({
    ...acc,
    [consumerName]: opts || (typeof opts === 'boolean' ? { disabled: !opts } : {}),
  }), {});

  variations.forEach((variation) => {
    const {
      title,
      createdAt: variationCreatedAt,
      options: allVariationConsumerOptions,
      render,
    } = variation;
    const { [consumer]: variationOptions = {} } = allVariationConsumerOptions || {};

    // this consumer is disabled
    if (!variationOptions || variationOptions.disabled) { return; }

    const componentName = Array.isArray(component)
      ? component.map(x => getComponentName(x))
      : getComponentName(component);

    const options = { ...rootConsumerOptions, ...variationOptions };
    const createdAt = variationCreatedAt || rootCreatedAt;

    const newVariation = {
      componentName,
      projectName,
      title,
      component,
      usage,
      options,
      rootOptions,
      ...(createdAt && { createdAt }),
      ...variation,
      options, // eslint-disable-line no-dupe-keys
      metadata,
      render,
    };
    callback(newVariation);
  });
}
