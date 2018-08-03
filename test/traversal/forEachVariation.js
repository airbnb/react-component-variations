import forEachVariation from '../../src/traversal/forEachVariation';

const mockVariation = {
  title: 'hi',
  render() {},
};

const consumer = 'foo';

const mockDescriptor = {
  component: 'mock-component',
  projectName: 'mock-project',
  createdAt: 'timestamp',
  usage: 'mock-usage',
  metadata: { foo: 'bar' },
  variations: [mockVariation],
  variationProvider: {
    path: 'a/b/c',
  },
  options: {
    [consumer]: {
      a: 'b',
    },
  },
};

describe('forEachVariation', () => {
  it('is a function', () => {
    expect(typeof forEachVariation).toBe('function');
  });

  it('throws with an invalid callback', () => {
    [true, false, [], {}, '', 'a', 42, null, undefined].forEach((nonFunction) => {
      expect(() => forEachVariation(mockDescriptor, consumer, nonFunction)).toThrow(TypeError);
    });

    expect(() => forEachVariation(mockDescriptor, consumer, () => {})).toThrow(TypeError);
    expect(() => forEachVariation(mockDescriptor, consumer, (a, b) => {})).toThrow(TypeError);
  });

  describe('callback function', () => {
    it('passes in the correct mockDescriptor data', () => {
      const expectedDescriptor = {
        ...mockDescriptor,
        ...mockVariation,
        componentName: mockDescriptor.component,
        options: mockDescriptor.options[consumer],
        rootOptions: mockDescriptor.options,
      };
      delete expectedDescriptor.variations;

      const callback = jest.fn((newVariation) => {
        expect(newVariation).toEqual(expectedDescriptor);
      });
      forEachVariation(mockDescriptor, consumer, callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
