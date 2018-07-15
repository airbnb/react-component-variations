import has from 'has';
import path from 'path';

function getNameAndPath(actualPath) {
  const componentName = path.basename(actualPath, path.extname(actualPath));
  const componentPath = path.dirname(actualPath).slice(2);

  return { componentName, componentPath };
}

function getFlattenedAlias(componentName, componentPath) {
  // Handle ComponentName/index.jsx:
  if (componentName === 'index') {
    const componentKey = componentPath.slice(componentPath.lastIndexOf('/') + 1);
    return componentKey;
  }

  return componentName;
}

/* eslint no-param-reassign: 0 */
export default function addComponentAliases(Components, actualPath, value, flattenComponentTree = false) {
  const { componentName, componentPath } = getNameAndPath(actualPath);

  const actualPathNoExtension = actualPath.slice(0, -path.extname(actualPath).length);
  Components[actualPathNoExtension] = value;

  if (flattenComponentTree) {
    const alias = getFlattenedAlias(componentName, componentPath);
    if (has(Components, alias)) {
      throw new TypeError(`
        There is more than one component with the name “${alias}”!
        Please rename one of these components, or set the \`flattenComponentTree\` option to \`false\`.
      `);
    }

    Components[alias] = value;
  } else {
    // `foo/bar/baz` gets stored as `foo/bar/:baz`
    // `foo/bar/index` gets stored as `foo/bar/:index`
    const dirKey = `${componentPath}/`;
    if (!Components[dirKey]) { Components[dirKey] = {}; }
    Components[dirKey][componentName] = value;

    // Handle ComponentName/index.jsx:
    if (componentName === 'index') {
      // `foo/bar/index` gets stored as `foo/bar`
      Components[componentPath] = value;
    } else {
      // `foo/bar/baz` gets stored as `foo/bar/baz`
      const directPathKey = `${componentPath}/${componentName}`;
      Components[directPathKey] = value;
    }
  }

  return Components;
}
