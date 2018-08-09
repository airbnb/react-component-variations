import has from 'has';

export default function getDefaultOrModule(Module) {
  return has(Module, 'default') ? Module.default : Module;
}
