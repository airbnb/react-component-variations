'use strict';

const chalk = require('chalk');
const path = require('path');
const { validate } = require('jsonschema');
const has = require('has');
const schema = require('../schema.json');

function getProxy(mock) {
  const properties = [];
  return new Proxy(this || {}, {
    get(target, property) {
      properties.push(property);
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
function ExtrasMock(extra) {
  return getProxy(property => new ExtraMock(extra, property));
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

  const Components = getProxy(name => (name.endsWith('/') ? Components : new ComponentMock(name)));
  const Extras = getProxy(extra => new ExtrasMock(extra));

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

exports.command = 'validate [variations]';
exports.desc = 'validate Variation Providers';
exports.builder = (yargs) => {
  yargs.demandOption('variations'); // this must come after config/pkgConf, so it can be supplied that way.
  yargs.positional('variations', {});

  const { project, projects } = yargs.argv;
  if (project && !has(projects, project)) {
    throw chalk.red(`Project "${project}" missing from projects config`);
  }
  if (project) {
    yargs.config(projects[project]);
  }
};
exports.handler = (argv) => {
  if (argv.variations.length === 0) {
    console.error(chalk.red(chalk.bold('No Variation Providers found.')));
    process.exit(1);
  }
  console.log(chalk.green(`${chalk.bold(argv.variations.length)} Variation Providers found...`));
  const errors = argv.variations.map((file) => {
    console.error = function throwError(msg) { throw new Error(msg); };
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const module = require(path.join(process.cwd(), file));
      validateDescriptorProvider(file, module.default || module);
      return null;
    } catch (e) {
      return formatMsg(file, e.message);
    }
  }).filter(Boolean);

  if (errors.length > 0) {
    errors.forEach((error) => { console.warn(error); });
    process.exit(errors.length);
  }
  console.log(chalk.green(`${chalk.bold('Success!')} All Variation Providers appear to be valid.`));
};
