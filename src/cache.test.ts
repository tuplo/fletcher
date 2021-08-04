/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import fletch from './index';

const fetchSpy = jest.fn();
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: (url: string) => fetchSpy(url),
}));

describe('cache', () => {
  afterEach(() => {
    fetchSpy.mockClear();
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  it('caches requests with the same url (text)', async () => {
    fetchSpy.mockResolvedValue({
      status: 200,
      text: async () => 'foobar',
    });

    const result = [];
    for await (const i of new Array(3).fill(null)) {
      const r = await fletch.text('https://foo.com', { cache: true });
      result.push(r);
    }

    const expected = ['foobar', 'foobar', 'foobar'];
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(expected);
  });

  it('caches requests with the same url (html)', async () => {
    fetchSpy.mockResolvedValue({
      status: 200,
      text: async () => '<h1>foobar</h1>',
    });

    const result = [];
    for await (const i of new Array(3).fill(null)) {
      const r = await fletch.html('https://foo.com', { cache: true });
      result.push(r);
    }

    const expected = ['foobar', 'foobar', 'foobar'];
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.map((r) => r.find('h1').text())).toStrictEqual(expected);
  });

  it('caches requests with the same url (json)', async () => {
    fetchSpy.mockResolvedValue({
      status: 200,
      json: async () => ({ foo: 'bar' }),
    });

    const result = [];
    for await (const i of new Array(3).fill(null)) {
      const r = await fletch.json('https://foo.com', { cache: true });
      result.push(r);
    }

    const expected = [{ foo: 'bar' }, { foo: 'bar' }, { foo: 'bar' }];
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(expected);
  });
});
