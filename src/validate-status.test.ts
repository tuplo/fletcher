import http from 'http';
import getPort from 'get-port';
import type { Server } from 'http';

import fletch from './index';

describe('validateStatus', () => {
  let server: Server;

  afterEach(() => {
    server.close();
  });

  it('validates status with default logic', async () => {
    const spy = jest.fn().mockImplementation((_, res) => {
      res.writeHead(404);
      res.end();
    });
    const port = await getPort();
    server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}`;

    const test = () => fletch.text(url, { retry: false });

    await expect(test).rejects.toThrow('Not Found');
  });

  it('validates status with custom logic (error)', async () => {
    const spy = jest.fn().mockImplementation((_, res) => {
      res.writeHead(202, 'Custom error');
      res.end();
    });
    const port = await getPort();
    server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}`;

    const test = () =>
      fletch.text(url, {
        retry: false,
        validateStatus: (status) => status !== 202,
      });

    await expect(test).rejects.toThrow('Custom error');
  });

  it('accepts undefined as option (default behavior)', async () => {
    const spy = jest.fn().mockImplementation((_, res) => {
      res.writeHead(500);
      res.end();
    });
    const port = await getPort();
    server = http.createServer(spy).listen(port);
    const url = `http://localhost:${port}`;

    const test = () =>
      fletch.text(url, {
        retry: false,
        validateStatus: undefined,
      });

    await expect(test).rejects.toThrow('Internal Server Error');
  });
});
