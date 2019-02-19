import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import getModuleFromPath from './getModuleFromPath';

import normalizeConfig from './normalizeConfig';
import interopRequireDefault from './interopRequireDefault';

export default function getProjectRootConfig(projectRoot = process.cwd(), configPath = undefined) {
  const config = configPath
    ? JSON.parse(fs.readFileSync(path.join(projectRoot, configPath)))
    : yargs.pkgConf('react-component-variations', projectRoot).parse('');

  const {
    extensions,
    requireInteropWrapper: requireInteropWrapperPath,
  } = config;

  if (requireInteropWrapperPath) {
    const requireInteropWrapper = getModuleFromPath(requireInteropWrapperPath, {
      extensions,
      projectRoot,
      requireInteropWrapper: interopRequireDefault,
    });

    return normalizeConfig({ ...config, requireInteropWrapper }, {
      projectRoot,
      requireInteropWrapper,
    });
  }

  return normalizeConfig(config, { projectRoot });
}
