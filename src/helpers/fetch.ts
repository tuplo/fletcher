import axios from 'axios';

import type * as FLETCH from '../fletcher.d';

function toFetchOptions(
  fletcherOptions: FLETCH.FletcherOptions
): FLETCH.FetchOptions {
  const {
    body,
    encoding,
    headers,
    maxRedirections = 999, // follow all redirects by default
    method = 'GET',
    proxy,
  } = fletcherOptions;

  const options: FLETCH.FetchOptions = {
    data: body,
    responseEncoding: encoding,
    headers,
    maxRedirects: maxRedirections,
    method,
    responseType: 'text',
  };

  if (proxy) {
    const { username, password, host, port, protocol = 'http' } = proxy;

    options.proxy = {
      protocol,
      host,
      port,
    };

    if (username && password) {
      options.proxy.auth = { username, password };
    }
  }

  return options;
}
export default async function fetch(
  url: string,
  fletcherOptions: FLETCH.FletcherOptions
): Promise<FLETCH.Response> {
  const options = toFetchOptions(fletcherOptions);

  const { data, headers, status, statusText } = await axios(url, options);

  return {
    headers,
    status,
    statusText,
    text: async () => data,
  };
}
