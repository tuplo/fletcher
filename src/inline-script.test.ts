import nock from 'nock';
import $ from 'cheerio';

import fletcher from './index';

describe('fletcher - inline scripts', () => {
  beforeAll(() => {
    const mocksDir = `${__dirname}/__data__`;
    nock('https://foo.com')
      .persist()
      .get('/inline-script.html')
      .replyWithFile(200, `${mocksDir}/inline-script.html`);
  });

  afterAll(() => {
    nock.cleanAll();
  });

  it('evaluates a script and returns its global scope', async () => {
    type PageData = { pageData: { foo: string } };
    const result = await fletcher.script<PageData>(
      'https://foo.com/inline-script.html',
      { scriptPath: 'script:nth-of-type(1)' }
    );

    const expected = { pageData: { foo: 'bar' } };
    expect(result).toMatchObject(expected);
  });

  it('uses a function to find a script element', async () => {
    const result = await fletcher.script('https://foo.com/inline-script.html', {
      scriptFindFn: (script: cheerio.Element) =>
        /findThisVar/.test($(script).html() || ''),
    });

    const expected = { findThisVar: true };
    expect(result).toStrictEqual(expected);
  });

  it('throws if options are not provided', async () => {
    const result = async () => {
      await fletcher.script('https://foo.com/inline-script.html');
    };

    const expected = new Error(
      'fletch.script: scriptPath or scriptFindFn are required'
    );
    // eslint-disable-next-line jest/no-test-return-statement
    return expect(result).rejects.toThrow(expected);
  });

  it('should return an empty object if script element is empty', async () => {
    const result = await fletcher.script('https://foo.com/inline-script.html', {
      scriptPath: 'script#foobar',
    });

    expect(result).toStrictEqual({});
  });
});
