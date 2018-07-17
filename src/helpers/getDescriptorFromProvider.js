import getProjectExtras from './getProjectExtras';

export default function getDescriptorFromProvider(provider, {
  Components,
  projectConfig,
  projectRoot,
  getExtras = undefined,
}) {
  return provider(Components, getProjectExtras({
    projectConfig,
    projectRoot,
    getExtras,
  }));
}
