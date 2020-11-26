import nock from 'nock';

import fletch from '.';

describe('fletch - HTTP client', () => {
  const mocksDir = `${__dirname}/__mocks__`;
  nock('https://foo.com')
    .persist()
    .get('/simple.html')
    .replyWithFile(200, `${mocksDir}/simple.html`);

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
});
