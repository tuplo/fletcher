import nock from 'nock';

import fletch from '.';

describe('fletch - HTTP client', () => {
  const mocksDir = `${__dirname}/__data__`;
  nock('https://foo.com')
    .persist()
    .get('/simple.html')
    .replyWithFile(200, `${mocksDir}/simple.html`)
    .get('/simple.json')
    .replyWithFile(200, `${mocksDir}/simple.json`);

  afterAll(() => {
    nock.cleanAll();
  });

  it('simple text (GET)', async () => {
    expect.assertions(1);
    const result = await fletch.text('https://foo.com/simple.html');

    const expected = /Simple heading/;
    expect(result).toMatch(expected);
  });

  it('simple html (GET)', async () => {
    expect.assertions(1);
    const $page = await fletch.html('https://foo.com/simple.html');
    const result = $page.find('h1').text();

    const expected = 'Simple heading';
    expect(result).toBe(expected);
  });

  it('simple json (GET)', async () => {
    expect.assertions(1);
    const result = await fletch.json('https://foo.com/simple.json');

    const expected = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });

  it('simple json (GET) with generic type', async () => {
    expect.assertions(1);
    type FooBar = { foo: string };
    const result = await fletch.json<FooBar>('https://foo.com/simple.json');

    const expected: FooBar = { foo: 'bar' };
    expect(result).toStrictEqual(expected);
  });
});
