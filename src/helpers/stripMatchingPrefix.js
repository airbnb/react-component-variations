import path from 'path';

function stripExtension(actualPath) {
  return path.join(path.dirname(actualPath), path.basename(actualPath, path.extname(actualPath)));
}

export default function stripMatchingPrefix(prefix, toStrip) {
  return stripExtension(toStrip.startsWith(prefix) ? toStrip.slice(prefix.length) : toStrip);
}
