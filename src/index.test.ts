import './__data__';
import fletcher from '.';

describe('fletcher - HTTP client', () => {
  it('simple text (GET)', async () => {
    const result = await fletcher.text('https://fletcher.dev/simple.html');

    const expected = /Simple heading/;
    expect(result).toMatch(expected);
  });

  it('simple html (GET)', async () => {
    const $page = await fletcher.html('https://fletcher.dev/simple.html');
    const result = $page.find('h1').text();

    const expected = 'Simple heading';
    expect(result).toBe(expected);
  });

  it('simple json (GET)', async () => {
    const result = await fletcher.json('https://fletcher.dev/simple.json');

    const expected = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });

  it('simple json (GET) with generic type', async () => {
    type FooBar = { foo: string };
    const result = await fletcher.json<FooBar>(
      'https://fletcher.dev/simple.json'
    );

    const expected: FooBar = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });

  it('json-ld (GET)', async () => {
    const result = await fletcher.jsonld('https://fletcher.dev/json-ld.html');

    const expected = {
      '@context': 'http://schema.org',
      '@type': 'MovieTheater',
      address:
        'Pacific Fair Shopping Centre, Level 1, Hooker Blvd, Broadbeach, QLD, 4218',
      brand: 'Event Cinemas',
      currenciesAccepted: 'AUD',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-28.0343100000',
        longitude: '153.4303300000',
        postalCode: '4218',
      },
      image: 'https://cdn.eventcinemas.com.au/cdn/content/img/ec-logo.svg',
      logo: 'https://cdn.eventcinemas.com.au/cdn/content/img/ec-logo.svg',
      name: 'Pacific Fair',
      openingHours: null,
      publicAccess: true,
      telephone: '(07) 5504 1401',
      url: 'https://www.eventcinemas.com.au/Cinema/Pacific-Fair',
    };
    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual(expected);
  });

  it('returns the headers on a request', async () => {
    const result = await fletcher.headers('https://fletcher.dev/headers');

    const expected = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });
});
