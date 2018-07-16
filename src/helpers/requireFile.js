import resolve from 'resolve';
import interopRequireDefault from 'babel-runtime/helpers/interopRequireDefault';

const defaultExtensionKeys = Object.keys(require.extensions);
const defaultExtensions = defaultExtensionKeys.length > 0 ? defaultExtensionKeys : ['.js', '.jsx'];

export default function requireFile(requirePath, {
  extensions = defaultExtensions,
  projectRoot = process.cwd(),
}) {
  const actualPath = resolve.sync(requirePath, { basedir: projectRoot, extensions });
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const Module = interopRequireDefault(require(actualPath));

  return { actualPath, Module };
}
