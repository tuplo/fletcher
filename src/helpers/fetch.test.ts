import '../__data__';
import type * as FLETCH from '../fletcher.d';
import fetch from './fetch';

describe('fetch', () => {
  it('includes the URL on an errored response', async () => {
    const url = 'https://fletcher.dev/error';
    const options = { method: 'GET' } as FLETCH.FletcherOptions;
    const result = await fetch(url, options);

    const expected = {
      headers: { foo: 'bar' },
      status: 500,
      statusText: '500 Internal Server Error - https://fletcher.dev/error',
      text: expect.anything(),
    };
    expect(result).toStrictEqual(expected);
  });
});
