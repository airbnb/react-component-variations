import getModuleFromPath from '../../src/helpers/getModuleFromPath';
import defaultObject from '../fixtures/defaultExportObject';
import interopRequireDefault from '../../src/helpers/interopRequireDefault';

describe('getDefaultOrModule', () => {
  const moduleConfig = {
    projectRoot: process.cwd(),
    requireInteropWrapper: interopRequireDefault,
  };

  it('throws with a out a string path or options', () => {
    expect(() => getModuleFromPath()).toThrow();
    expect(() => getModuleFromPath(null)).toThrow();
    expect(() => getModuleFromPath(undefined)).toThrow();
    expect(() => getModuleFromPath('./test/fixtures/defaultExportObject')).toThrow();
  });

  it('returns the default export module from a given file', () => {
    expect(getModuleFromPath('./test/fixtures/defaultExportObject', moduleConfig)).toEqual(defaultObject);
  });

  it('returns undefined if there are no default exports for a given file', () => {
    expect(getModuleFromPath('./test/fixtures/namedExports', moduleConfig)).toBe(undefined);
  });
});
