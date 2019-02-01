import forEachProject from '../../src/traversal/forEachProject';

describe('forEachProject', () => {
  it('is a function', () => {
    expect(typeof forEachProject).toBe('function');
  });

  it('throws when it receives a non-empty `projects` array', () => {
    [undefined, null, '', 'foo', {}, () => {}, true, 42, false].forEach((nonArray) => {
      expect(() => forEachProject({}, nonArray, x => ({ x }))).toThrow(TypeError);
    });

    expect(() => forEachProject({}, [], x => ({ x }))).toThrow(TypeError);
  });

  const mockProjectConfig = {
    components: 'glob/path/to/components',
    variations: 'glob/path/to/variations',
  };

  it('validates the project config', () => {
    expect(() => forEachProject({ a: {}, b: mockProjectConfig }, ['a', 'b'], x => ({ x }))).toThrow(SyntaxError);
    expect(() => forEachProject({ a: mockProjectConfig, b: {} }, ['a', 'b'], x => ({ x }))).toThrow(SyntaxError);
    expect(() => forEachProject({ a: mockProjectConfig, b: {} }, ['b'], x => ({ x }))).toThrow(SyntaxError);
    expect(() => forEachProject({ a: mockProjectConfig, b: {} }, ['a'], x => ({ x }))).not.toThrow();
  });

  it('throws if the callback is not a function with a length of 1 or 2', () => {
    [undefined, null, '', 'foo', {}, [], true, 42, false].forEach((nonFunction) => {
      expect(() => forEachProject({ a: mockProjectConfig }, ['a'], nonFunction)).toThrow(TypeError);
    });

    expect(() => forEachProject({ a: mockProjectConfig }, ['a'], () => {})).toThrow(TypeError);
    expect(() => forEachProject({ a: mockProjectConfig }, ['a'], (a, b, c) => ({ a, b, c }))).toThrow(TypeError);
  });

  it('calls the callback with the expected arguments', () => {
    const callback = jest.fn(x => ({ x }));

    const bProjectConfig = { ...mockProjectConfig, require: ['test'] };

    forEachProject({
      a: mockProjectConfig,
      b: bProjectConfig,
      c: mockProjectConfig,
    }, ['a', 'b'], callback);

    expect(callback).toHaveBeenCalledTimes(2);
    const { calls: [aArgs, bArgs] } = callback.mock;

    expect(aArgs).toEqual([
      'a',
      mockProjectConfig,
    ]);
    expect(bArgs).toEqual([
      'b',
      bProjectConfig,
    ]);
  });
});
