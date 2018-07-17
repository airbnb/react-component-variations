import getDescriptorFromProvider from '../../src/helpers/getDescriptorFromProvider';

jest.mock('../../src/helpers/requireFile', () => filePath => ({ filePath }));
jest.mock('../../src/helpers/getProjectExtras', () => jest.fn(({
  getExtras = () => {},
}) => ({
  ...getExtras(),
})));

const projectConfig = {
  components: 'path/to/components',
  variations: 'path/to/variations',
  extensions: ['.gif', '.html'],
  extras: {
    a: 'some file',
    b: 'some other file',
  },
};

describe('getDescriptorFromProvider', () => {
  beforeEach(() => {
    require('../../src/helpers/getProjectExtras').mockClear();
  });

  it('is a function', () => {
    expect(typeof getDescriptorFromProvider).toBe('function');
  });

  it('invokes the provided function with the right arguments', () => {
    const provider = jest.fn();
    const Components = {};
    const getExtras = jest.fn(() => ({ a: true }));

    getDescriptorFromProvider(provider, {
      projectConfig,
      Components,
      getExtras,
    });

    expect(provider).toHaveBeenCalledTimes(1);
    const { calls: [args] } = provider.mock;
    const [actualComponents, actualExtras] = args;

    expect(actualComponents).toBe(Components);
    expect(actualExtras).toMatchObject({
      a: true,
    });
  });

  it('provides a default getExtras', () => {
    const provider = jest.fn();
    const Components = {};

    getDescriptorFromProvider(provider, { Components, projectConfig });
    expect(provider).toHaveBeenCalledTimes(1);
    const { calls: [args] } = provider.mock;
    const [actualComponents, actualExtras] = args;

    expect(actualExtras).toMatchObject({});
  });

  it('invokes the provided `getExtras`', () => {
    const provider = jest.fn();
    const Components = { components: '' };
    const getExtras = jest.fn();
    const projectRoot = { root: '' };
    const getProjectExtras = require('../../src/helpers/getProjectExtras');

    getDescriptorFromProvider(provider, { Components, projectConfig, projectRoot, getExtras });

    expect(getProjectExtras).toHaveBeenCalledTimes(1);
    expect(getProjectExtras).toHaveBeenCalledWith(expect.objectContaining({
      projectConfig,
      projectRoot,
      getExtras,
    }))
  });
});
