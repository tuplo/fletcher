import fromUserOptions from './options';

describe('fletch - general options', () => {
  it('searchParams', () => {
    expect.assertions(1);
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
