import forEachProjectVariation from '../../src/traversal/forEachProjectVariation';

const mockProjectConfig = {
  components: 'glob/path/to/components',
  variations: 'glob/path/to/variations',
};

const mockProjectName = 'some awesome project';
const mockProjectName2 = 'a better project';

const mockDescriptor = {};

const consumer = 'cookie monster';

jest.mock('../../src/helpers/getComponents', () => jest.fn(() => ({
  'path/to/component': { actualPath: 'path/to/component.js', Module: {} },
})));
jest.mock('../../src/helpers/getVariations', () => jest.fn(() => ({
  'path/to/VariationProvider': jest.fn(() => mockDescriptor),
})));

const mockProjectNames = [mockProjectName, mockProjectName2];

jest.mock('../../src/traversal/forEachVariation');
jest.mock('../../src/helpers/getProjectRootConfig', () => (projectRoot, configPath) => {
  return {
    projects: {
      [mockProjectName]: { ...mockProjectConfig },
      [mockProjectName2]: { ...mockProjectConfig },
    },
    projectNames: mockProjectNames,
  };
});

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
      expect(() => traverse((a, b) => {})).toThrow(TypeError);
    });
  });

  it('invokes `forEachVariation` with the expected arguments', () => {
    const traverse = forEachProjectVariation(consumer);
    const callback = (x) => {};
    const forEachVariation = require('../../src/traversal/forEachVariation');
    const rootConfig = require('../../src/helpers/getProjectRootConfig')();

    traverse(callback);

    expect(mockProjectNames.length).toBeGreaterThan(0);
    expect(forEachVariation).toHaveBeenCalledTimes(mockProjectNames.length);
    const { calls } = forEachVariation.mock;

    calls.forEach((args, idx) => {
      expect(args).toEqual([{ projectName: mockProjectNames[idx], ...mockDescriptor }, consumer, callback]);
    });
  });
});
