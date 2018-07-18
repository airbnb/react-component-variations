import path from 'path';
import glob from 'glob';

export default function globToFiles(arg, projectRoot = process.cwd()) {
  if (Array.isArray(arg)) {
    return arg;
  }
  return glob.sync(arg, { cwd: projectRoot }).map(x => `./${path.normalize(x)}`);
}
