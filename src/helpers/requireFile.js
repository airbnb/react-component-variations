import resolve from 'resolve';
import interopRequireDefault from './interopRequireDefault';

const defaultExtensionKeys = Object.keys(require.extensions);
const defaultExtensions = defaultExtensionKeys.length > 0 ? defaultExtensionKeys : ['.js', '.jsx'];

export default function requireFile(requirePath, {
  extensions = defaultExtensions,
  projectRoot = process.cwd(),
  requireInteropWrapper = interopRequireDefault,
  lazyRequire = false,
}) {
  const getModule = () => {
    const actualPath = resolve.sync(requirePath, { basedir: projectRoot, extensions });
    return {
      actualPath,
      // eslint-disable-next-line global-require, import/no-dynamic-require
      Module: requireInteropWrapper(require(actualPath)),
    };
  };

  return lazyRequire ? getModule : getModule();
}
