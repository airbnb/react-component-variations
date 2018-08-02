import forEachVariation from '../../src/traversal/forEachVariation';

const mockDescriptor = {
  component: 'mock-component',
  projectName: 'mock-project',
  createdAt: 'timestamp',
  usage: 'mock-usage',
  metadata: { foo: 'bar' },
  variations: [],
};

describe('forEachVariation', () => {
  it('is a function', () => {
    expect(typeof forEachVariation).toBe('function');
  });

  describe('callback function', () => {
    it('passes in the correct mockDescriptor data', () => {
      const callback = (newVariation) => {
        Object.keys(mockDescriptor).forEach((property) => {
          if (property === 'variations') {
            return;
          }
          expect(mockDescriptor[property]).toEqual(newVariation[property]);
        });
      };
      forEachVariation(mockDescriptor, {}, callback);
    });
  });
});
