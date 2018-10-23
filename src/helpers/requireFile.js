import resolve from 'resolve';
import interopRequireDefault from './interopRequireDefault';

const defaultExtensionKeys = Object.keys(require.extensions);
const defaultExtensions = defaultExtensionKeys.length > 0 ? defaultExtensionKeys : ['.js', '.jsx'];

export default function requireFile(requirePath, {
  extensions = defaultExtensions,
  projectRoot = process.cwd(),
  requireInteropWrapper = interopRequireDefault,
}) {
  const actualPath = resolve.sync(requirePath, { basedir: projectRoot, extensions });
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const Module = requireInteropWrapper(require(actualPath));

  return { actualPath, Module };
}
