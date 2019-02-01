import isValidProjectName from '../../src/helpers/isValidProjectName';

describe('isValidProjectName', () => {
  it('is a function', () => {
    expect(typeof isValidProjectName).toBe('function');
  });

  it('returns false if `project` is not a string', () => {
    [undefined, null, 42, [], {}, () => {}].forEach((x) => {
      expect(isValidProjectName({}, x)).toBe(false);
    });
  });

  it('returns false if `project` is an empty string', () => {
    expect(isValidProjectName({}, '')).toBe(false);
  });

  it('returns false if `projects` lacks a key for `project`', () => {
    expect(isValidProjectName({}, 'foo')).toBe(false);
  });

  it('returns true if `projects` has a key for `project`', () => {
    expect(isValidProjectName({ foo: true }, 'foo')).toBe(true);
  });
});
