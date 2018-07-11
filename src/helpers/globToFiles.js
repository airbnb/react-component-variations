import path from 'path';
import glob from 'glob';

export default function globToFiles(arg) {
  if (Array.isArray(arg)) {
    return arg;
  }
  return glob.sync(arg).map(x => `./${path.normalize(x)}`);
}
