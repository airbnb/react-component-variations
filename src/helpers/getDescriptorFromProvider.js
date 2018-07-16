import getProjectExtras from './getProjectExtras';

export default function getDescriptorFromProvider(provider, {
  Components,
  projectConfig,
  projectRoot,
  getExtras = undefined,
}) {
  return provider(Components, {
    action() { return () => {}; },
    fixtures: {},
    ...getProjectExtras({
      projectConfig,
      projectRoot,
      getExtras,
    }),
  });
}
