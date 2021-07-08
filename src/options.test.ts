import fromUserOptions, { getDefaultOptions } from './options';

describe('fletch - general options', () => {
  it('delay', () => {
    const result = fromUserOptions('https://foo.com', {
      delay: 1_000,
    });
    const expected = {
      ...getDefaultOptions(),
      delay: 1_000,
      url: 'https://foo.com',
    };
    expect(result).toStrictEqual(expected);
  });

  it('headers', () => {
    const result = fromUserOptions('https://foo.com', {
      headers: { foo: 'bar' },
    });
    const expected = {
      ...getDefaultOptions(),
      url: 'https://foo.com',
      headers: { foo: 'bar' },
    };
    expect(result).toStrictEqual(expected);
  });

  it('urlSearchParams', () => {
    const result = fromUserOptions('https://foo.com', {
      urlSearchParams: {
        foo: 'bar',
      },
    });
    const expected = {
      ...getDefaultOptions(),
      url: 'https://foo.com/?foo=bar',
    };
    expect(result).toStrictEqual(expected);
  });
});
