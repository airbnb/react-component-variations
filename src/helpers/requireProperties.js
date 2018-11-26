import fromEntries from 'object.fromentries';
import entries from 'object.entries';

import requireFile from './requireFile';

export default function requireProperties(obj, propertyNames, {
  extensions,
  projectRoot,
  requireInteropWrapper,
} = {}) {
  const newEntries = propertyNames.map((name) => {
    const { [name]: path } = obj;
    if (path) {
      const getModule = requireFile(path, {
        extensions,
        projectRoot,
        requireInteropWrapper,
        lazyRequire: true,
      });
      return [
        name,
        (...args) => {
          const m = getModule();
          const { Module: { default: required } } = m;
          return required(...args);
        },
      ];
    }
    return null;
  }).filter(Boolean);
  return fromEntries(entries(obj).concat(newEntries));
}
