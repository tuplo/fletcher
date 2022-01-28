import { createServer } from 'http';
import type { Server } from 'http';

import fletcher from './index';

describe('body formats', () => {
  let server: Server;

  beforeAll(() => {
    server = createServer((request, response) => {
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', () => {
        response.end(
          JSON.stringify({
            method: request.method,
            headers: request.headers,
            body,
          })
        );
      });
    }).listen();
  });

  afterAll(() => {
    server.close();
  });

  it('formData', async () => {
    const { port } = server.address() as { port: number };
    const url = `http://localhost:${port}`;
    const result = await fletcher.json(url, {
      formData: { foo: 'bar', baz: 'quz' },
    });

    const expected = {
      method: 'POST',
      headers: expect.objectContaining({
        'content-type': 'application/x-www-form-urlencoded',
      }),
      body: 'foo=bar&baz=quz',
    };
    expect(result).toStrictEqual(expected);
  });

  it('formUrlEncoded', async () => {
    const { port } = server.address() as { port: number };
    const url = `http://localhost:${port}`;
    const result = await fletcher.json(url, {
      formUrlEncoded: { foo: 'bar', baz: 'quz' },
    });

    const expected = {
      method: 'POST',
      headers: expect.objectContaining({
        'content-type': 'application/x-www-form-urlencoded',
      }),
      body: 'foo=bar&baz=quz',
    };
    expect(result).toStrictEqual(expected);
  });

  it('jsonData', async () => {
    const { port } = server.address() as { port: number };
    const url = `http://localhost:${port}`;
    const result = await fletcher.json(url, {
      jsonData: { foo: 'bar', baz: 'quz' },
    });

    const expected = {
      method: 'POST',
      headers: expect.objectContaining({
        'content-type': 'application/json',
      }),
      body: '{"foo":"bar","baz":"quz"}',
    };
    expect(result).toStrictEqual(expected);
  });
});
