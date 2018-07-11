import getDescriptorFromProvider from '../../src/helpers/getDescriptorFromProvider';

describe('getDescriptorFromProvider', () => {
  it('is a function', () => {
    expect(typeof getDescriptorFromProvider).toBe('function');
  });

  it('invokes the provided function with the right arguments', () => {
    const provider = jest.fn();
    const Components = {};
    const getExtras = jest.fn(() => ({ a: true }));

    getDescriptorFromProvider(provider, {
      Components,
      getExtras,
    });

    expect(provider).toHaveBeenCalledTimes(1);
    const { calls: [args] } = provider.mock;
    const [actualComponents, actualExtras] = args;

    expect(actualComponents).toBe(Components);
    expect(actualExtras).toMatchObject({
      action: expect.any(Function),
      fixtures: {},
      a: true,
    });
  });

  it('provides a default getExtras', () => {
    const provider = jest.fn();
    const Components = {};

    getDescriptorFromProvider(provider, { Components });
    expect(provider).toHaveBeenCalledTimes(1);
    const { calls: [args] } = provider.mock;
    const [actualComponents, actualExtras] = args;

    expect(actualExtras).toMatchObject({
      action: expect.any(Function),
      fixtures: {},
    });
  });

  it('provides an appropriate "action" mock in the returned descriptor', () => {
    const provider = jest.fn();
    const Components = {};

    getDescriptorFromProvider(provider, { Components });
    expect(provider).toHaveBeenCalledTimes(1);
    const { calls: [args] } = provider.mock;
    const [actualComponents, actualExtras] = args;

    expect(actualExtras).toMatchObject({
      action: expect.any(Function),
    });

    const actionReturn = actualExtras.action();
    expect(typeof actionReturn).toBe('function');

    expect(actionReturn()).toBe(undefined);
  });
});