import nock from 'nock';

import fletch from '.';

describe('fletch - HTTP client', () => {
  const mocksDir = `${__dirname}/__data__`;
  nock('https://foo.com')
    .persist()
    .get('/simple.html')
    .replyWithFile(200, `${mocksDir}/simple.html`)
    .get('/simple.json')
    .replyWithFile(200, `${mocksDir}/simple.json`)
    .get('/json-ld.html')
    .replyWithFile(200, `${mocksDir}/json-ld.html`);

  afterAll(() => {
    nock.cleanAll();
  });

  it('simple text (GET)', async () => {
    const result = await fletch.text('https://foo.com/simple.html');

    const expected = /Simple heading/;
    expect(result).toMatch(expected);
  });

  it('simple html (GET)', async () => {
    const $page = await fletch.html('https://foo.com/simple.html');
    const result = $page.find('h1').text();

    const expected = 'Simple heading';
    expect(result).toBe(expected);
  });

  it('simple json (GET)', async () => {
    const result = await fletch.json('https://foo.com/simple.json');

    const expected = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });

  it('simple json (GET) with generic type', async () => {
    type FooBar = { foo: string };
    const result = await fletch.json<FooBar>('https://foo.com/simple.json');

    const expected: FooBar = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });

  it('json-ld (GET)', async () => {
    const result = await fletch.jsonld('https://foo.com/json-ld.html');

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
});
