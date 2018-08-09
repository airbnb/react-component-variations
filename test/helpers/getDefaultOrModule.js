import getDefaultOrModule from '../../src/helpers/getDefaultOrModule';

describe('getDefaultOrModule', () => {
  it('throws with a non-object', () => {
    expect(() => getDefaultOrModule()).toThrow();
    expect(() => getDefaultOrModule(null)).toThrow();
    expect(() => getDefaultOrModule(undefined)).toThrow();
  });

  it('returns the Module when it lacks "default"', () => {
    const Module = {};
    expect(getDefaultOrModule(Module)).toEqual(Module);
  });

  it('returns the default when present', () => {
    const Module = { default: {} };
    expect(getDefaultOrModule(Module)).toEqual(Module.default);
  });
});
