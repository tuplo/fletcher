import type { CacheParams } from '../fletcher.d';
import Cache from './cache';

describe('cache', () => {
  const cache = new Cache();

  describe('computes key', () => {
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

  describe('accepts custom methods', () => {
    const url = 'https://foo.com/page-1';
    let cacheParams: CacheParams;
    const defaultCacheParams: CacheParams = {
      format: 'json',
      url,
      options: { cache: true },
    };

    beforeEach(() => {
      cacheParams = JSON.parse(JSON.stringify(defaultCacheParams));
    });

    it('uses hit custom method', () => {
      const hitSpy = jest.fn().mockReturnValue('foobar');
      cacheParams.options = {
        ...cacheParams.options,
        cacheMethods: { hit: hitSpy },
      };
      const result = cache.hit(cacheParams);

      expect(result).toBe('foobar');
      expect(hitSpy).toHaveBeenCalledTimes(1);
      expect(hitSpy).toHaveBeenCalledWith('7d88ae4a2b86b865dcb18c73434a4702');
    });

    it('uses write custom method', () => {
      const writeSpy = jest.fn();
      cacheParams = {
        ...cacheParams,
        options: {
          ...cacheParams.options,
          cacheMethods: { write: writeSpy },
        },
        payload: 'foobar',
      };
      cache.write(cacheParams);

      expect(writeSpy).toHaveBeenCalledTimes(1);
      expect(writeSpy).toHaveBeenCalledWith(
        '7d88ae4a2b86b865dcb18c73434a4702',
        'foobar'
      );
    });

    it('uses key custom method', () => {
      const keySpy = jest.fn().mockReturnValue('key-1');
      cacheParams = {
        ...cacheParams,
        options: {
          ...cacheParams.options,
          cacheMethods: { key: keySpy },
        },
      };
      cache.key(cacheParams);

      expect(keySpy).toHaveBeenCalledTimes(1);
      expect(keySpy).toHaveBeenCalledWith(cacheParams);
    });
  });
});
