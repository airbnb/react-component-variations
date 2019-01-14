import getProjectExtras from './getProjectExtras';

export default function getDescriptorFromProvider(provider, {
  projectConfig,
  projectRoot,
  getExtras = undefined,
  projectMetadata = undefined,
}) {
  const descriptor = provider(getProjectExtras({
    projectConfig,
    projectRoot,
    getExtras,
  }));
  return {
    ...descriptor,
    ...(projectMetadata && {
      metadata: {
        ...projectMetadata,
        ...descriptor.metadata,
      },
    }),
  };
}
