'use strict';

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
    options: { [consumer]: rootOptions = {} } = {},
    variations,
  } = descriptor;

  // this consumer is disabled
  if (!rootOptions || rootOptions.disabled) { return; }

  variations.forEach((variation) => {
    const {
      title,
      createdAt: variationCreatedAt,
      options: { [consumer]: variationOptions = {} } = {},
      render,
    } = variation;

    // this consumer is disabled
    if (!variationOptions || variationOptions.disabled) { return; }

    const componentName = Array.isArray(component)
      ? component.map(x => getComponentName(x))
      : getComponentName(component);

    const options = Object.assign({}, rootOptions, variationOptions);
    const createdAt = variationCreatedAt || rootCreatedAt;

    const newVariation = Object.assign(
      {
        componentName,
        title,
        component,
        usage,
        options,
        rootOptions: rootOptions || {},
      },
      createdAt && { createdAt },
      variation,
      { options, render }
    );
    callback(newVariation);
  });
};
