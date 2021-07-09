import getPort from 'get-port';
import http from 'http';

import fletch from './index';

describe('creates an instance with options', () => {
  it('simple text (GET)', async () => {
    const port = await getPort();
    const spy = jest.fn((_, res) => res.end());
    const server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}/`;

    const instance = fletch.create({ headers: { foo: 'bar' } });
    await instance.text(url);

    const expected = { foo: 'bar' };
    expect(spy.mock.calls[0][0].headers).toMatchObject(expected);

    server.close();
  });

  it('simple html (GET)', async () => {
    const port = await getPort();
    const spy = jest.fn((_, res) => res.end());
    const server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}/`;

    const instance = fletch.create({ headers: { foo: 'bar' } });
    await instance.html(url);

    const expected = { foo: 'bar' };
    expect(spy.mock.calls[0][0].headers).toMatchObject(expected);

    server.close();
  });

  it('simple json (GET)', async () => {
    const port = await getPort();
    const spy = jest.fn((_, res) => {
      res.writeHead(200, {
        'Content-type': 'application/json',
      });
      res.write(JSON.stringify({ baz: 'buz' }));
      res.end();
    });
    const server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}/`;

    const instance = fletch.create({ headers: { foo: 'bar' } });
    const result = await instance.json(url);

    const expected = { foo: 'bar' };
    expect(spy.mock.calls[0][0].headers).toMatchObject(expected);
    expect(result).toStrictEqual({ baz: 'buz' });

    server.close();
  });

  it('simple json (GET) with generic type', async () => {
    const port = await getPort();
    const spy = jest.fn((_, res) => {
      res.writeHead(200, {
        'Content-type': 'application/json',
      });
      res.write(JSON.stringify({ baz: 'buz' }));
      res.end();
    });
    const server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}/`;

    const instance = fletch.create({ headers: { foo: 'bar' } });
    type FooBar = { foo: string };
    const result = await instance.json<FooBar>(url);

    const expected: FooBar = { foo: 'bar' };
    expect(spy.mock.calls[0][0].headers).toMatchObject(expected);
    expect(result).toStrictEqual({ baz: 'buz' });

    server.close();
  });

  it('accepts new options but keeps initial config', async () => {
    const port = await getPort();
    const spy = jest.fn((_, res) => res.end());
    const server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}/`;

    const instance = fletch.create({ headers: { foo: 'bar' } });
    await instance.html(url, { headers: { baz: 'buz' } });

    const expected = { foo: 'bar', baz: 'buz' };
    expect(spy.mock.calls[0][0].headers).toMatchObject(expected);

    server.close();
  });

  it('accepts calling create with no parameters', async () => {
    const port = await getPort();
    const spy = jest.fn((_, res) => res.end());
    const server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}/`;

    const instance = fletch.create();
    await instance.html(url, { headers: { baz: 'buz' } });

    const expected = { baz: 'buz' };
    expect(spy.mock.calls[0][0].headers).toMatchObject(expected);

    server.close();
  });
});
