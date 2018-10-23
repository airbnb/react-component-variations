import fromEntries from 'object.fromentries';

import requireFile from './requireFile';

export default function requireFiles(arg, {
  projectRoot = process.cwd(),
  requireInteropWrapper,
  extensions = undefined,
} = {}) {
  if (arg && !Array.isArray(arg) && typeof arg === 'object') {
    return arg;
  }

  const entries = [].concat(arg).map(requirePath => [
    requirePath,
    requireFile(requirePath, { projectRoot, requireInteropWrapper, extensions }),
  ]);

  return fromEntries(entries);
}
