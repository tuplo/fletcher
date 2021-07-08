import fromUserOptions from './options';

describe('fletch - general options', () => {
  it('headers', () => {
    const result = fromUserOptions('https://foo.com', {
      headers: { foo: 'bar' },
    });

    const expected = {
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
      url: 'https://foo.com/?foo=bar',
    };
    expect(result).toStrictEqual(expected);
  });
});
