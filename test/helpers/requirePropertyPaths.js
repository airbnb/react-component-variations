import requirePropertyPaths from '../../src/helpers/requirePropertyPaths';

jest.mock('../../src/helpers/requireFile', () => jest.fn((...args) => ({ Module: args })));

const projectRoot = 'root';
const extensions = ['js', 'jsx'];

describe('requirePropertyPaths', () => {
  beforeEach(() => {
    require('../../src/helpers/requireFile').mockClear();
  });

  it('returns a falsy value directly', () => {
    expect(requirePropertyPaths(undefined, {})).toEqual(undefined);
    expect(requirePropertyPaths(null, {})).toEqual(null);
    expect(requirePropertyPaths(false, {})).toEqual(false);
    expect(requirePropertyPaths(0, {})).toEqual(0);
    expect(requirePropertyPaths(NaN, {})).toEqual(NaN);
    expect(requirePropertyPaths('', {})).toEqual('');
  });

  it('returns an equivalent cloned object', () => {
    const obj = {};
    expect(requirePropertyPaths(obj, {})).not.toBe(obj);
    expect(requirePropertyPaths(obj, {})).toEqual(obj);
  });

  it('calls into requireFile', () => {
    const obj = {
      a: 'path to a',
      b: 'path to b',
    };

    const result = requirePropertyPaths(obj, { projectRoot, extensions });
    expect(result).toEqual({
      a: [obj.a, { projectRoot, extensions }],
      b: [obj.b, { projectRoot, extensions }],
    });

    const mockRequireFile = require('../../src/helpers/requireFile');
    expect(mockRequireFile).toHaveBeenCalledTimes(2);
  });
});
