import Cache from './cache';

describe('cache', () => {
  describe('computes key', () => {
    const cache = new Cache();

    it.each([
      ['https://foo1.com', '9860d2bb1ea923d6ec8dff0932290810'],
      ['https://foo2.com', 'eb9e7b1f0deb957b09dfa1bc9d241482'],
    ])('builds a unique string out of different URLs: %s', (url, expected) => {
      const cacheParams = { format: 'json', url };
      const result = cache.key(cacheParams);
      expect(result).toBe(expected);
    });

    it.each([
      ['text', 'e749c83266352cfbc2e9b0087f2333a0'],
      ['json', '94744c63b019e984a58314e09be7233b'],
      ['html', '6b3c51560c5bb9590fed59edc48d0e30'],
      ['script', '13288af19cb33f580e58976401fdeaad'],
    ])(
      'builds a unique string out of different formats on the URL: %s',
      (format, expected) => {
        const cacheParams = { format, url: 'https://foo.com' };
        const result = cache.key(cacheParams);
        expect(result).toBe(expected);
      }
    );

    it.each([
      [{ headers: { foo: 'bar' } }, 'c7f42c503fdc30cac43d51b291f488e2'],
      [{ headers: { bar: 'foo' } }, '3fbe3651340c892b6cf6aee5fe17a577'],
    ])(
      'builds a unique string out of different options on the URL',
      (options, expected) => {
        const cacheParams = { format: 'json', url: 'https://foo.com', options };
        const result = cache.key(cacheParams);
        expect(result).toBe(expected);
      }
    );

    it.each([
      [
        {
          headers: { foo: 'bar', baz: 'buz' },
          urlSearchParams: { quz: 'qaz', qaz: 'quz' },
        },
      ],
      [
        {
          headers: { baz: 'buz', foo: 'bar' },
          urlSearchParams: { qaz: 'quz', quz: 'qaz' },
        },
      ],
    ])(
      'builds the same cache key for options ordered differently',
      (options) => {
        const cacheParams = { format: 'json', url: 'https://foo.com', options };
        const result = cache.key(cacheParams);
        const expected = '78fea821662f03807adabbfb82cfd298';
        expect(result).toBe(expected);
      }
    );
  });
});
