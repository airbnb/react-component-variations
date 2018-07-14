import resolve from 'resolve';
import fromEntries from 'object.fromentries';
import interopRequireDefault from 'babel-runtime/helpers/interopRequireDefault';

const defaultExtensionKeys = Object.keys(require.extensions);
const defaultExtensions = defaultExtensionKeys.length > 0 ? defaultExtensionKeys : ['.js', '.jsx'];

export default function requireFiles(arg, {
  projectRoot = process.cwd(),
  extensions = defaultExtensions,
} = {}) {
  if (arg && !Array.isArray(arg) && typeof arg === 'object') {
    return arg;
  }

  const entries = [].concat(arg).map((requirePath) => {
    const actualPath = resolve.sync(requirePath, { basedir: projectRoot, extensions });
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const Module = interopRequireDefault(require(actualPath));

    return [
      requirePath,
      { actualPath, Module },
    ];
  });

  return fromEntries(entries);
}
