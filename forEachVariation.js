'use strict';

const entries = require('object.entries');

const getComponentName = function getComponentName(C) {
  if (typeof C === 'string') {
    return C;
  }
  if (typeof C === 'function') {
    return C.displayName || C.name;
  }
  return null;
};

module.exports = function forEachVariation(descriptor, consumer, callback) {
  const {
    component,
    createdAt: rootCreatedAt,
    usage,
    noVisualSignificance: rootNoVisualSignificance,
    options: allRootConsumerOptions = {},
    variations,
  } = descriptor;
  const { [consumer]: rootConsumerOptions = {} } = allRootConsumerOptions || {};

  // this consumer is disabled
  if (!rootConsumerOptions || rootConsumerOptions.disabled) { return; }

  const rootOptions = entries(allRootConsumerOptions).reduce((acc, [consumerName, opts]) => (
    Object.assign({}, acc, { [consumerName]: opts || (opts === false ? { disabled: true } : {}) })
  ), {});

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

    const options = Object.assign({}, rootConsumerOptions, variationOptions);
    const createdAt = variationCreatedAt || rootCreatedAt;

    const noVisualSignificance = typeof variationNoVisualSignificance === 'boolean'
      ? variationNoVisualSignificance
      : rootNoVisualSignificance;

    const newVariation = Object.assign(
      {
        componentName,
        title,
        component,
        usage,
        options,
        rootOptions,
      },
      createdAt && { createdAt },
      typeof noVisualSignificance === 'boolean' && { noVisualSignificance },
      variation,
      { options, render }
    );
    callback(newVariation);
  });
};
