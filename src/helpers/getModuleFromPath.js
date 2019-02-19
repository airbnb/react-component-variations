import requireFile from './requireFile';

export default function getModuleFromPath(path, options) {
  const { Module: { default: requiredModule } } = requireFile(path, options);
  return requiredModule;
}
