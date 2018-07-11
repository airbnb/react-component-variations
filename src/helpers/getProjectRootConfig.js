import path from 'path';
import fs from 'fs';
import yargs from 'yargs';

import normalizeConfig from './normalizeConfig';

export default function getProjectRootConfig(projectRoot = process.cwd(), configPath = undefined) {
  const config = configPath
    ? JSON.parse(fs.readFileSync(path.join(projectRoot, configPath)))
    : yargs.pkgConf('react-component-variations', projectRoot).parse('');
  return normalizeConfig(config);
}
