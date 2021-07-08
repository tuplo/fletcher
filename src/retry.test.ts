import getPort from 'get-port';
import http from 'http';

import fromUserOptions, { getDefaultOptions } from './options';
import fletch from './index';

describe('retry', () => {
  it('retries failed request', async () => {
    let i = 1;
    const port = await getPort();
    const spy = jest.fn().mockImplementation((_, res) => {
      res.writeHead(i < 3 ? 500 : 200);
      i += 1;
      res.end();
    });
    const server = http.createServer(spy).listen(port);

    await fletch.html(`http://localhost:${port}/`, {
      retry: {
        retries: 3,
        factor: 1,
        minTimeout: 1,
        maxTimeout: 1,
        randomize: false,
      },
    });
    expect(spy).toHaveBeenCalledTimes(3);
    server.close();
  });

  it("doesn't retry if options.retry=false", async () => {
    const spy = jest.fn().mockImplementation((_, res) => {
      res.writeHead(500);
      res.end();
    });
    const port = await getPort();
    const server = http.createServer(spy).listen(port);

    const r = fletch.html(`http://localhost:${port}`, {
      retry: false,
    });

    await expect(r).rejects.toThrow('Internal Server Error');
    expect(spy).toHaveBeenCalledTimes(1);

    server.close();
  });

  it(`retries number of times if retry:number`, async () => {
    const mathRandomSpy = jest.spyOn(Math, `random`).mockReturnValue(0.1);
    const spy = jest.fn().mockImplementation((_, res) => {
      res.writeHead(500);
      res.end();
    });
    const port = await getPort();
    const server = http.createServer(spy).listen(port);

    const r = fletch.html(`http://localhost:${port}`, {
      retry: 1,
    });
    await expect(r).rejects.toThrow(`Internal Server Error`);
    expect(spy).toHaveBeenCalledTimes(2);

    server.close();
    mathRandomSpy.mockRestore();
  });
});

describe('retry options', () => {
  it('default options', () => {
    const result = fromUserOptions('https://foo.com');
    const expected = {
      factor: 2,
      maxTimeout: Infinity,
      minTimeout: 1000,
      randomize: true,
      retries: 10,
    };
    expect(result.retry).toStrictEqual(expected);
  });

  it('changes number of retries', () => {
    const result = fromUserOptions('https://foo.com', { retry: 3 });
    const expected = {
      factor: 2,
      maxTimeout: Infinity,
      minTimeout: 1000,
      randomize: true,
      retries: 3,
    };
    expect(result.retry).toStrictEqual(expected);
  });

  it('disables retry', () => {
    const result = fromUserOptions('https://foo.com', { retry: false });
    const expected = { retries: 0 };
    expect(result.retry).toStrictEqual(expected);
  });
});
