import has from 'has';
import values from 'object.values';

import { validate } from 'jsonschema';
import schema from '../schema.json';
import getProjectExtras from './getProjectExtras';
import getDefaultOrModule from './getDefaultOrModule';
import NO_COMPONENT from '../NO_COMPONENT';

function getProxy(mock) {
  const properties = [];
  return new Proxy(this || {}, {
    get(target, property) {
      if (properties.indexOf(property) < 0) {
        properties.push(property);
      }
      return mock.call(target, property);
    },
    ownKeys() {
      return properties;
    },
  });
}

function getStaticProperty(p) {
  if (this && p in this) { return Reflect.get(this, p); }
  if (p !== 'getDefaultProps') { // avoid a React warning
    return () => p;
  }
  return undefined;
}

function ExtraMock(extra, property) {
  this.extra = extra;
  this.property = property;
  return getProxy.call(this, getStaticProperty);
}
function ExtrasMock(extra, {
  projectExtras,
}) {
  return getProxy.call(projectExtras[extra], property => (
    has(projectExtras[extra], property) ? projectExtras[extra][property] : new ExtraMock(extra, property)
  ));
}

function formatMsg(file, msg) {
  return `${file}:\n  ${msg}\n`;
}

function validateDescriptorProvider(file, provider, {
  actualComponents,
  projectConfig,
  projectRoot,
}) {
  if (typeof provider !== 'function') {
    throw new TypeError('provider must be a function');
  }

  if (provider.length !== 0 && provider.length !== 1) {
    throw new RangeError(`provider function must take exactly 0 or 1 arguments: takes ${provider.length}`);
  }

  const projectExtras = getProjectExtras({
    projectConfig,
    projectRoot,
  });
  const Extras = getProxy(extra => new ExtrasMock(extra, { projectExtras }));

  const descriptor = provider(Extras);

  const components = Array.isArray(descriptor.component)
    ? descriptor.component
    : [descriptor.component];
  components.forEach((component) => {
    if (!actualComponents.has(component)) {
      throw new TypeError('descriptor must have a "component" property, with a value exported from one of the files in the "components" glob (or an array of them)');
    }
  });

  const { errors } = validate(descriptor, schema);
  if (errors.length > 0) {
    throw new SyntaxError(`received invalid descriptor object:\n   - ${errors.join('\n   - ')}`);
  }

  descriptor.variations.forEach((variation, i) => {
    if (typeof variation.render !== 'function') {
      throw new TypeError(`variation index ${i}: 'render' must be a function`);
    }
    if (variation.render.length !== 0) {
      throw new RangeError(`variation index ${i}: 'render' function takes no arguments`);
    }
    // TODO: assert on return
  });
}

export default function getValidationErrors(variations, {
  componentMap,
  projectConfig,
  projectRoot,
}) {
  const origError = console.error;

  const componentValues = values(componentMap)
    .map(({ Module }) => getDefaultOrModule(Module))
    .concat(NO_COMPONENT);
  const actualComponents = new Set(componentValues);

  return values(variations).map(({ actualPath, Module }) => {
    console.error = function throwError(msg) { throw new Error(`${actualPath}: “${msg}”`); };
    try {
      validateDescriptorProvider(actualPath, getDefaultOrModule(Module), {
        actualComponents,
        projectConfig,
        projectRoot,
      });
      console.error = origError;
      return null;
    } catch (e) {
      return formatMsg(actualPath, e.message);
    }
  }).filter(Boolean);
}
