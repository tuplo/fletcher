import fromUserOptions, { getDefaultOptions } from './index';

describe('fletcher - general options', () => {
  it('delay', () => {
    const result = fromUserOptions('https://foo.com', {
      delay: 1_000,
    });
    expect(result.delay).toBe(1_000);
  });

  it('headers', () => {
    const result = fromUserOptions('https://foo.com', {
      headers: { foo: 'bar' },
    });
    const expected = { foo: 'bar' };
    expect(result.headers).toMatchObject(expected);
  });

  it('urlSearchParams', () => {
    const result = fromUserOptions('https://foo.com', {
      urlSearchParams: {
        foo: 'bar',
      },
    });
    const expected = 'https://foo.com/?foo=bar';
    expect(result.url).toBe(expected);
  });

  it('formData', () => {
    const result = fromUserOptions('https://foo.com', {
      formData: {
        foo: 'bar',
        'query[post_type][]': 'films',
      },
    });

    const expected = 'foo=bar&query%5Bpost_type%5D%5B%5D=films';
    expect(result.method).toBe('POST');
    expect(result.body?.toString()).toBe(expected);
  });

  it('sets referer', () => {
    const result = getDefaultOptions('http://foo.com');
    const expected = {
      referer: 'http://foo.com',
    };
    expect(result.headers).toMatchObject(expected);
  });

  describe('proxy', () => {
    it('accepts proxy configuration', () => {
      const result = fromUserOptions('http://foo.com', {
        proxy: {
          username: 'mock-user',
          password: 'mock-passwd',
          host: 'mock-host',
          port: 76,
        },
      });
      expect(result.agent).toBeDefined();
    });

    it('accepts undefined as a proxy config', () => {
      const result = fromUserOptions('http://foo.com', {
        proxy: undefined,
      });
      expect(result.agent).toBeUndefined();
    });
  });
});
