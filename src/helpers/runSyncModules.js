import promiseTry from 'promise.try';

import interopRequireDefault from './interopRequireDefault';
import getModuleFromPath from './getModuleFromPath';

function getSyncModule(config, syncScriptPath) {
  const {
    projectRoot = process.cwd(),
  } = config;

  return getModuleFromPath(syncScriptPath, {
    projectRoot,
    requireInteropWrapper: interopRequireDefault,
  });
}

export default function runSyncModules(config) {
  const {
    sync,
  } = config;

  return sync.hooks.reduce(
    (prev, syncScriptPath) => prev.then(() => {
      const module = getSyncModule(config, syncScriptPath);
      return promiseTry(() => module(config));
    }),
    Promise.resolve(),
  ).then(() => {});
}
