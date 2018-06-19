'use strict';

const entries = require('object.entries');
const getComponentName = require('airbnb-prop-types/build/helpers/getComponentName');

module.exports = function forEachVariation(descriptor, consumer, callback) {
  const {
    component,
    createdAt: rootCreatedAt,
    usage,
    noVisualSignificance: rootNoVisualSignificance,
    options: allRootConsumerOptions = {},
    metadata = {},
    variations,
  } = descriptor;
  const { [consumer]: rootConsumerOptions = {} } = allRootConsumerOptions || {};

  // this consumer is disabled
  if (!rootConsumerOptions || rootConsumerOptions.disabled) { return; }

  const rootOptions = entries(allRootConsumerOptions).reduce((acc, [consumerName, opts]) => ({
    ...acc,
    [consumerName]: opts || (opts === false ? { disabled: true } : {}),
  }), {});

  variations.forEach((variation) => {
    const {
      title,
      createdAt: variationCreatedAt,
      noVisualSignificance: variationNoVisualSignificance,
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

    const noVisualSignificance = typeof variationNoVisualSignificance === 'boolean'
      ? variationNoVisualSignificance
      : rootNoVisualSignificance;

    const newVariation = {
      componentName,
      title,
      component,
      usage,
      options,
      rootOptions,
      ...(createdAt && { createdAt }),
      ...(typeof noVisualSignificance === 'boolean' && { noVisualSignificance }),
      ...variation,
      options,
      metadata,
      render,
    };
    callback(newVariation);
  });
};
