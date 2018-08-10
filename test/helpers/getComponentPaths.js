import getComponentPaths from '../../src/helpers/getComponentPaths';

const mockModuleA = { named: {} };
const mockActualPathA = 'path/to/componentA.js';
const mockRequirePathA = 'path/to/componentA';

const mockModuleB = { default: {} };
const mockActualPathB = 'path/to/componentB.js';
const mockRequirePathB = 'path/to/componentB';

jest.mock('../../src/helpers/getComponents', () => jest.fn(() => ({
  [mockRequirePathA]: { actualPath: mockActualPathA, Module: mockModuleA },
  [mockRequirePathB]: { actualPath: mockActualPathB, Module: mockModuleB },
})));

const projectConfig = {};
const projectConfigWithRoot = {
  componentsRoot: {},
};
const projectRoot = 'root';

describe('getComponentPaths', () => {
  it('finds a module by default export', () => {
    const paths = getComponentPaths(projectConfig, projectRoot, mockModuleB.default);
    expect(paths).toMatchObject({
      actualPath: mockActualPathB,
      requirePath: mockRequirePathB,
      projectRoot,
    });
  });

  it('finds a module without default exports', () => {
    const paths = getComponentPaths(projectConfig, projectRoot, mockModuleA);
    expect(paths).toMatchObject({
      actualPath: mockActualPathA,
      requirePath: mockRequirePathA,
      projectRoot,
    });
  });

  it('includes the componentsRoot when present', () => {
    const paths = getComponentPaths(projectConfigWithRoot, projectRoot, mockModuleA);
    expect(paths).toMatchObject({
      actualPath: mockActualPathA,
      requirePath: mockRequirePathA,
      projectRoot,
      componentsRoot: projectConfigWithRoot.componentsRoot,
    });
  });
});
