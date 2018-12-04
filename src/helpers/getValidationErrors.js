import has from 'has';
import values from 'object.values';

import { validate } from 'jsonschema';
import schema from '../schema.json';
import getProjectExtras from './getProjectExtras';
import getDefaultOrModule from './getDefaultOrModule';

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

function ComponentMock(name) {
  const C = () => null;
  C.displayName = name;
  Object.setPrototypeOf(C, ComponentMock.prototype);
  return getProxy.call(C, getStaticProperty);
}
function ExtraMock(extra, property) {
  this.extra = extra;
  this.property = property;
  return getProxy.call(this, getStaticProperty);
}
function ExtrasMock(extra, {
  projectExtras,
}) {
  return getProxy(property => (
    has(projectExtras, property) ? projectExtras[property] : new ExtraMock(extra, property)
  ));
}

function formatMsg(file, msg) {
  return `${file}:\n  ${msg}\n`;
}

function validateDescriptorProvider(file, provider, {
  projectConfig,
  projectRoot,
}) {
  if (typeof provider !== 'function') {
    throw new TypeError('provider must be a function');
  }

  if (provider.length !== 1 && provider.length !== 2) {
    throw new RangeError(`provider function must take exactly 1 or 2 arguments: takes ${provider.length}`);
  }

  const Components = getProxy(name => (name.endsWith('/') ? Components : new ComponentMock(name)));
  const projectExtras = getProjectExtras({
    projectConfig,
    projectRoot,
  });
  const Extras = getProxy(extra => new ExtrasMock(extra, { projectExtras }));

  const descriptor = provider(Components, Extras);

  const components = Array.isArray(descriptor.component)
    ? descriptor.component
    : [descriptor.component];
  components.forEach((component) => {
    if (!(component instanceof ComponentMock)) {
      throw new TypeError('descriptor must have a "component" property, with a value destructured from the first provider argument (or an array of them)');
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
  projectConfig,
  projectRoot,
}) {
  const origError = console.error;
  return values(variations).map(({ actualPath, Module }) => {
    console.error = function throwError(msg) { throw new Error(`${actualPath}: “${msg}”`); };
    try {
      validateDescriptorProvider(actualPath, getDefaultOrModule(Module), {
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
