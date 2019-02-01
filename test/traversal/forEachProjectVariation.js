import mockInteropRequireDefault from '../../src/helpers/interopRequireDefault';

import forEachProjectVariation from '../../src/traversal/forEachProjectVariation';

const mockProjectConfig = {
  componentsRoot: 'glob/',
  components: './path/to/components/**',
  variationsRoot: 'glob/',
  variations: './path/to/variations/**',
};

const mockProjectName = 'some awesome project';
const mockProjectName2 = 'a better project';

const mockDescriptor = {
  a: 'b',
  c: 'd',
};

const mockVariationPath = 'glob/path/to/RealVariationProvider';
const mockVariationHierarchy = 'path/to/RealVariationProvider';
const mockVariationActualPath = `${mockVariationHierarchy}.js`;

const consumer = 'cookie monster';

jest.mock('../../src/helpers/getComponents', () => jest.fn(() => ({
  'path/to/component': { actualPath: 'path/to/component.js', Module: {} },
})));
jest.mock('../../src/helpers/getVariationProviders', () => jest.fn(() => ({
  [mockVariationPath]: {
    actualPath: mockVariationActualPath,
    Module: mockInteropRequireDefault(jest.fn(() => mockDescriptor)),
  },
})));

const mockProjectNames = [mockProjectName, mockProjectName2];

jest.mock('../../src/traversal/forEachVariation');
jest.mock('../../src/helpers/getProjectRootConfig', () => () => ({
  projects: {
    [mockProjectName]: { ...mockProjectConfig },
    [mockProjectName2]: { ...mockProjectConfig },
  },
  projectNames: mockProjectNames,
}));

describe('forEachProjectVariation', () => {
  it('is a function', () => {
    expect(typeof forEachProjectVariation).toBe('function');
  });

  it('returns a function', () => {
    const traverse = forEachProjectVariation(consumer);
    expect(typeof traverse).toBe('function');
  });

  describe('traverse', () => {
    it('requires a callback function of length 1', () => {
      const traverse = forEachProjectVariation(consumer);
      [null, true, false, 42, '', [], {}].forEach((nonFunction) => {
        expect(() => traverse(nonFunction)).toThrow(TypeError);
      });

      expect(() => traverse(() => {})).toThrow(TypeError);
      expect(() => traverse((a, b) => ({ a, b }))).toThrow(TypeError);
    });
  });

  it('invokes `forEachVariation` with the expected arguments', () => {
    const traverse = forEachProjectVariation(consumer);
    const callback = x => ({ x });
    const forEachVariation = require('../../src/traversal/forEachVariation');

    traverse(callback);

    expect(mockProjectNames.length).toBeGreaterThan(0);
    expect(forEachVariation).toHaveBeenCalledTimes(mockProjectNames.length);
    const { calls } = forEachVariation.mock;

    calls.forEach((args, idx) => {
      expect(args).toEqual([
        expect.objectContaining({
          projectName: mockProjectNames[idx],
          ...mockDescriptor,
          variationProvider: expect.objectContaining({
            path: mockVariationPath,
            resolvedPath: mockVariationActualPath,
            hierarchy: mockVariationHierarchy,
          }),
        }),
        consumer,
        callback,
      ]);
    });
  });
});
