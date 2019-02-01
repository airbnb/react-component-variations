import path from 'path';
import getComponents from '../../src/helpers/getComponents';

jest.mock('../../src/helpers/validateProject', () => jest.fn());
jest.mock('../../src/helpers/globToFiles', () => jest.fn(() => ['a', 'b', 'n']));
jest.mock('../../src/helpers/requireFiles', () => jest.fn(paths => paths.reduce((obj, filePath) => ({
  ...obj,
  [filePath]: {
    actualPath: filePath,
    Module: filePath >= 'foo' ? { default() {} } : { named() {} },
  },
}), {})));

describe('getComponents', () => {
  beforeEach(() => {
    require('../../src/helpers/validateProject').mockClear();
    require('../../src/helpers/globToFiles').mockClear();
    require('../../src/helpers/requireFiles').mockClear();
  });

  it('validates the provided config', () => {
    const projectConfig = {
      components: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const mock = require('../../src/helpers/validateProject');
    const projectRoot = 'a/b/c';

    getComponents(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(projectConfig);
  });

  it('passes components path to `globToFiles`', () => {
    const projectConfig = {
      components: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const mock = require('../../src/helpers/globToFiles');
    const projectRoot = 'a/b/c';

    getComponents(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(projectConfig.components, projectRoot);
  });

  it('passes components path to `globToFiles` with `componentsRoot`', () => {
    const projectConfig = {
      components: 'foo',
      componentsRoot: 'bar',
      extensions: ['.js', '.jsx'],
    };
    const mock = require('../../src/helpers/globToFiles');
    const projectRoot = 'a/b/c';

    getComponents(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(
      projectConfig.components,
      path.join(projectRoot, projectConfig.componentsRoot),
    );
  });

  it('works with `flattenComponentTree` option', () => {
    const projectConfig = {
      components: 'foo/index',
      extensions: ['.js', '.jsx'],
      flattenComponentTree: true,
    };
    const mock = require('../../src/helpers/globToFiles');
    const projectRoot = 'a/b/c';

    getComponents(projectConfig, projectRoot);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(projectConfig.components, projectRoot);
  });

  it('passes expected args to `requireFiles`', () => {
    const projectConfig = {
      components: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const globOutput = require('../../src/helpers/globToFiles')();
    const mock = require('../../src/helpers/requireFiles');
    const projectRoot = 'a/b/c';

    getComponents(projectConfig, projectRoot);

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
      components: 'foo',
      extensions: ['.js', '.jsx'],
    };
    const projectRoot = 'a/b/c';
    const mock = require('../../src/helpers/requireFiles');

    const sentinel = {};
    mock.mockReturnValue(sentinel);
    const fileMap = getComponents(projectConfig, projectRoot, { fileMapOnly: true });

    expect(fileMap).toBe(sentinel);
  });
});
