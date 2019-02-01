import interopRequireDefault from '../../src/helpers/interopRequireDefault';
import forEachDescriptor from '../../src/traversal/forEachDescriptor';

let mockComponents;
let mockVariations;

jest.mock('../../src/helpers/getComponents', () => jest.fn(() => mockComponents));
jest.mock('../../src/helpers/getVariationProviders', () => jest.fn(() => mockVariations));

describe('forEachDescriptor', () => {
  beforeEach(() => {
    require('../../src/helpers/getComponents').mockClear();
    require('../../src/helpers/getVariationProviders').mockClear();
    mockComponents = {
      'path/to/component': { actualPath: 'path/to/component.js', Module: {} },
    };
    mockVariations = {
      'path/to/VariationProvider': {
        Module: interopRequireDefault(jest.fn()),
        actualPath: '/full/path/to/VariationProvider.jsx',
      },
      'path/to/another/VariationProvider': {
        Module: jest.fn(),
        actualPath: '/full/path/to/another/VariationProvider.jsx',
      },
    };
  });

  it('is a function', () => {
    expect(typeof forEachDescriptor).toBe('function');
  });

  const mockProjectConfig = {
    components: 'glob/path/to/components',
    variations: 'glob/path/to/variations',
  };

  it('throws when `getDescriptor` is not a 1 or 2 arg function', () => {
    [null, true, false, 42, '', [], {}].forEach((nonFunction) => {
      expect(() => forEachDescriptor(mockProjectConfig, { getDescriptor: nonFunction })).toThrow(TypeError);
    });

    expect(() => forEachDescriptor(mockProjectConfig, { getDescriptor() {} })).toThrow(TypeError);
    expect(() => forEachDescriptor(mockProjectConfig, {
      getDescriptor(a, b, c) { return (a, b, c); },
    })).toThrow(TypeError);
  });

  it('returns a function', () => {
    const traverse = forEachDescriptor(mockProjectConfig);
    expect(typeof traverse).toBe('function');
  });

  it('calls `getComponents` and `getVariationProviders`', () => {
    const getComponents = require('../../src/helpers/getComponents');
    const getVariationProviders = require('../../src/helpers/getVariationProviders');

    forEachDescriptor(mockProjectConfig);

    expect(getComponents).toHaveBeenCalledTimes(1);
    expect(getComponents).toHaveBeenCalledWith(mockProjectConfig, expect.any(String));

    expect(getVariationProviders).toHaveBeenCalledTimes(1);
    expect(getVariationProviders).toHaveBeenCalledWith(
      mockProjectConfig,
      expect.any(String),
      expect.objectContaining({
        fileMapOnly: true,
      }),
    );
  });

  describe('traversal function', () => {
    const projectRoot = 'some root';
    const descriptor = {};
    let getExtras;
    let getDescriptor;
    beforeEach(() => {
      getExtras = jest.fn();
      // eslint-disable-next-line no-unused-vars
      getDescriptor = jest.fn(x => descriptor);
    });

    it('throws when `callback` is not a 1-arg function', () => {
      const traverse = forEachDescriptor(mockProjectConfig, {
        getExtras,
        getDescriptor,
        projectRoot,
      });

      [null, true, false, 42, '', [], {}].forEach((nonFunction) => {
        expect(() => traverse(nonFunction)).toThrow(TypeError);
      });

      expect(() => traverse(() => {})).toThrow(TypeError);
      expect(() => traverse(a => ({ a }))).not.toThrow(TypeError);
      expect(() => traverse((a, b) => ({ a, b }))).not.toThrow(TypeError);
      expect(() => traverse((a, b, c) => ({ a, b, c }))).toThrow(TypeError);
    });

    it('throws with no components', () => {
      mockComponents = {};
      expect(() => forEachDescriptor(mockProjectConfig, {
        getExtras,
        getDescriptor,
        projectRoot,
      })).toThrow(RangeError);
    });

    it('throws with no variations', () => {
      mockVariations = {};
      expect(() => forEachDescriptor(mockProjectConfig, {
        getExtras,
        getDescriptor,
        projectRoot,
      })).toThrow(RangeError);
    });

    it('iterates variations', () => {
      const a = jest.fn();
      const b = jest.fn();

      const variationsRoot = 'glob/variations/path/';
      const componentsRoot = 'glob/components/path/';
      const mockProjectConfigWithRoots = {
        componentsRoot,
        components: './to/components/**',
        variationsRoot,
        variations: './to/variations/**',
      };

      const variationPathA = `${projectRoot}/${variationsRoot}path/to/a`;
      const variationPathB = `${projectRoot}/${variationsRoot}path/to/b`;

      mockVariations = {
        [variationPathA]: {
          Module: interopRequireDefault(a),
          actualPath: `${variationPathA}.extA`,
        },
        [variationPathB]: {
          Module: interopRequireDefault(b),
          actualPath: `${variationPathB}.extB`,
        },
      };
      const traverse = forEachDescriptor(mockProjectConfigWithRoots, {
        getExtras,
        getDescriptor,
        projectRoot,
      });

      const Components = require('../../src/helpers/getComponents')();
      const variations = require('../../src/helpers/getVariationProviders')();

      const callback = jest.fn(x => ({ x }));
      traverse(callback);

      expect(getDescriptor).toHaveBeenCalledTimes(2);
      const [firstDescriptorArgs, secondDescriptorArgs] = getDescriptor.mock.calls;
      expect(firstDescriptorArgs).toEqual([
        a,
        expect.objectContaining({
          projectConfig: mockProjectConfigWithRoots,
          Components,
          variations,
          getExtras,
        }),
      ]);
      expect(secondDescriptorArgs).toEqual([
        b,
        expect.objectContaining({
          projectConfig: mockProjectConfigWithRoots,
          Components,
          variations,
          getExtras,
        }),
      ]);

      expect(callback).toHaveBeenCalledTimes(2);
      const [first, second] = callback.mock.calls;
      expect(first).toEqual([descriptor, {
        variationProvider: {
          hierarchy: 'path/to/a',
          path: variationPathA,
          resolvedPath: mockVariations[variationPathA].actualPath,
        },
        variationPath: variationPathA,
      }]);
      expect(second).toEqual([descriptor, {
        variationProvider: {
          hierarchy: 'path/to/b',
          path: variationPathB,
          resolvedPath: mockVariations[variationPathB].actualPath,
        },
        variationPath: variationPathB,
      }]);
    });

    it('throws when the provider is not a function', () => {
      mockVariations = {
        'path/to/a': {
          Module: interopRequireDefault(true),
        },
      };
      const traverse = forEachDescriptor(mockProjectConfig, {
        getExtras,
        getDescriptor,
        projectRoot,
      });

      const callback = jest.fn(x => ({ x }));
      expect(() => traverse(callback)).toThrow(TypeError);
    });

    it('provides a default `getExtras`', () => {
      const a = jest.fn();
      mockVariations = {
        'path/to/a': {
          Module: interopRequireDefault(a),
          actualPath: 'path/to/a.extension',
        },
      };
      const traverse = forEachDescriptor(mockProjectConfig, {
        getDescriptor,
        projectRoot,
      });

      const callback = jest.fn(x => ({ x }));
      traverse(callback);

      expect(getDescriptor).toHaveBeenCalledTimes(1);
      const [firstDescriptorArgs] = getDescriptor.mock.calls;
      const [, extras] = firstDescriptorArgs;
      expect(typeof extras.getExtras).toBe('function');
      expect(() => extras.getExtras()).not.toThrow();
    });
  });
});
