#!/usr/bin/env node
'use strict'

const glob = require('glob');
const path = require('path');
const validate = require('jsonschema').validate;
const schema = require('./schema.json');

const paths = glob.sync(process.argv[2]);

function getProxy(mock) {
  const properties = [];
  return new Proxy(this || {}, {
    get(target, property, receiver) {
      properties.push(property);
      return mock(property);
    },
    ownKeys(target) {
      return properties;
    },
  });
}

function getStaticProperty(p) {
  if (p !== 'getDefaultProps') { // avoid a React warning
    return () => p;
  }
}

function ComponentMock(name) {
  const C = () => null;
  C.displayName = name;
  Object.setPrototypeOf(C, ComponentMock.prototype);
  return getProxy.call(C, getStaticProperty);
}
function ExtraMock() {
}
function ExtrasMock(extra) {
  return getProxy(property => new ExtraMock(property));
}

function formatMsg(file, msg) {
  return `${file}:\n  ${msg}\n`;
}

function validateDescriptorProvider(file, provider) {
  if (typeof provider !== 'function') {
    throw new TypeError('provider must be a function');
  }

  if (provider.length !== 1 && provider.length !== 2) {
    throw new RangeError(`provider function must take exactly 1 or 2 arguments: takes ${provider.length}`);
  }

  const Components = getProxy(name => new ComponentMock(name));
  const Extras = getProxy(extra => new ExtrasMock(extra));

  const descriptor = provider(Components, Extras);

  const components = Array.isArray(descriptor.component) ? descriptor.component : [descriptor.component];
  descriptor.component.forEach((component) => {
    if (!(component instanceof ComponentMock)) {
      throw new TypeError('descriptor must have a "component" property, with a value destructured from the first provider argument (or an array of them)');
    }
  });

  const { errors } = validate(descriptor, schema);
  if (errors.length > 0) {
    throw new SyntaxError(`received invalid descriptor object:\n${errors.join('\n  ')}`);
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

require('babel-register');


const errors = paths.map(x => {
  const file = path.normalize(x);
  try {
    console.error = function (msg) { throw new Error(msg); };
    const module = require(path.join(process.cwd(), x));
    validateDescriptorProvider(file, module.default || module);
    return null;
  } catch (e) {
    return formatMsg(file, e.message.split('\n')[0]);
  }
}).filter(Boolean);

if (errors.length > 0) {
  errors.forEach((error) => { console.warn(error); });
  process.exit(errors.length);
}
