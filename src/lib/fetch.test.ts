import type * as FLETCH from '../fletcher';
import '../__data__';
import { fetch } from './fetch';

describe('fetch', () => {
  it('includes the URL on an errored response', async () => {
    const url = 'https://fletcher.dev/error';
    const options = { method: 'GET' } as FLETCH.FletcherOptions;
    const result = await fetch(url, options);

    const expected = {
      headers: { foo: 'bar' },
      status: 500,
      statusText:
        'Request failed with status code 500 - https://fletcher.dev/error',
      text: expect.anything(),
    };
    expect(result).toStrictEqual(expected);
  });
});
