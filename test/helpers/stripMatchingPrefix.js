import stripMatchingPrefix from '../../src/helpers/stripMatchingPrefix';

describe('stripMatchingPrefix', () => {
  it('correctly strips toStrip prefix', () => {
    const toStrip = '/Users/foo/bar/baz/buzz/bang/quox/stories/a/b/c/dvariationProvider.jsx';
    const prefix = '/Users/foo/bar/baz/buzz/bang/quox/stories/';
    expect(stripMatchingPrefix(prefix, toStrip)).toEqual('a/b/c/dvariationProvider');
  });
});
