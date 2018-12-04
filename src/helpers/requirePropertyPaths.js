import fromEntries from 'object.fromentries';
import entries from 'object.entries';

import requireFile from './requireFile';
import getDefaultOrModule from './getDefaultOrModule';

export default function requirePropertyPaths(obj, { projectRoot, extensions }) {
  const newEntries = entries(obj).map(([key, filePath]) => {
    const { Module } = requireFile(filePath, { projectRoot, extensions });
    return [key, getDefaultOrModule(Module)];
  });
  return fromEntries(newEntries);
}
