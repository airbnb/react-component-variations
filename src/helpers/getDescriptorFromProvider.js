'use strict';

module.exports = function getDescriptorFromProvider(provider, {
  Components,
  getExtras = () => {},
}) {
  return provider(Components, {
    action() { return () => {}; },
    fixtures: {},
    ...getExtras(),
  });
};
