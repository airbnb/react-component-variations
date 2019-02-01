import path from 'path';
import getVariationProviders from '../../src/helpers/getVariationProviders';

jest.mock('../../src/helpers/validateProject', () => jest.fn());
jest.mock('../../src/helpers/globToFiles', () => jest.fn(() => ['a', 'b', 'n']));
jest.mock('../../src/helpers/requireFiles', () => jest.fn(paths => paths.reduce((obj, filePath) => ({
  ...obj,
  [filePath]: {
    actualPath: filePath,
    Module: filePath >= 'foo' ? { default() {} } : { named() {} },
  },
}), {})));

describe('getVariationProviders', () => {
  beforeEach(() => {
    require('../../src/helpers/validateProject').mockClear();
    require('../../src/helpers/globToFiles').mockClear();
    require('../../src/helpers/requireFiles').mockClear();
  });

  it('validates the provided config', () => {
    const projectConfig = {
      variations: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const mock = require('../../src/helpers/validateProject');
    const projectRoot = 'a/b/c';

    getVariationProviders(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(projectConfig);
  });

  it('passes variations path to `globToFiles`', () => {
    const projectConfig = {
      variations: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const mock = require('../../src/helpers/globToFiles');
    const projectRoot = 'a/b/c';

    getVariationProviders(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(projectConfig.variations, projectRoot);
  });

  it('passes variations path to `globToFiles` with `variationsRoot`', () => {
    const projectConfig = {
      variations: 'foo',
      variationsRoot: 'bar',
      extensions: ['.js', '.jsx'],
    };
    const mock = require('../../src/helpers/globToFiles');
    const projectRoot = 'a/b/c';

    getVariationProviders(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(
      projectConfig.variations,
      path.join(projectRoot, projectConfig.variationsRoot),
    );
  });

  it('passes expected args to `requireFiles`', () => {
    const projectConfig = {
      variations: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const globOutput = require('../../src/helpers/globToFiles')();
    const mock = require('../../src/helpers/requireFiles');
    const projectRoot = 'a/b/c';

    getVariationProviders(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    const { calls: [args] } = mock.mock;
    const [actualGlobOutput, requireOptions] = args;
    expect(actualGlobOutput).toEqual(globOutput);
    expect(requireOptions).toMatchObject({
      projectRoot,
      extensions: projectConfig.extensions,
    });
  });

  it('returns the fileMap directly when `fileMapOnly`', () => {
    const projectConfig = {
      variations: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const projectRoot = 'a/b/c';
    const mock = require('../../src/helpers/requireFiles');

    const sentinel = {};
    mock.mockReturnValue(sentinel);
    const fileMap = getVariationProviders(projectConfig, projectRoot, { fileMapOnly: true });

    expect(fileMap).toBe(sentinel);
  });
});
