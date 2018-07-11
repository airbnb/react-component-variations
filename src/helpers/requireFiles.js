import resolve from 'resolve';
import fromEntries from 'object.fromentries';

const defaultExtensionKeys = Object.keys(require.extensions);
const defaultExtensions = defaultExtensionKeys.length > 0 ? defaultExtensionKeys : ['.js', '.jsx'];

export default function requireFiles(arg, {
  projectRoot = process.cwd(),
  extensions = defaultExtensions,
} = {}) {
  if (arg && !Array.isArray(arg) && typeof arg === 'object') {
    return arg;
  }
  return fromEntries([].concat(arg).map(requirePath => [
    requirePath,
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(resolve.sync(requirePath, { basedir: projectRoot, extensions })),
  ]));
}
