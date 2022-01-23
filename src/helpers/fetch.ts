/* eslint-disable no-restricted-syntax */
import { request, ProxyAgent } from 'undici';
import { STATUS_CODES } from 'http';
import type * as FLETCH from '../fletcher.d';

function toFetchOptions(
  fletcherOptions: FLETCH.FletcherOptions
): FLETCH.FetchOptions {
  const {
    body,
    headers,
    maxRedirections = 999, // follow all redirects by default
    method = 'GET',
    proxy,
  } = fletcherOptions;

  const options: FLETCH.FetchOptions = {
    body,
    headers,
    maxRedirections,
    method,
  };

  if (proxy) {
    const { username, password, host, port, protocol = 'http' } = proxy;
    const auth = [username, password].filter(Boolean).join(':');
    const basicAuth = Buffer.from(auth).toString('base64');

    options.dispatcher = new ProxyAgent(`${protocol}://${host}:${port}`);
    options.headers = {
      ...options.headers,
      'proxy-authorization': `Basic ${basicAuth}`,
    };
  }

  return options;
}
export default async function fetch(
  url: string,
  fletcherOptions: FLETCH.FletcherOptions
): Promise<FLETCH.Response> {
  const options = toFetchOptions(fletcherOptions);
  const { body, statusCode, headers } = await request(url, options);

  return {
    body,
    headers,
    status: statusCode,
    statusText: STATUS_CODES[statusCode],
    text: () => body.text(),
  };
}
