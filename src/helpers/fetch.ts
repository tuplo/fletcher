import axios from 'axios';
import https from 'https';
import HttpsProxyAgent from 'https-proxy-agent';

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
    rejectUnauthorized,
    validateStatus,
  } = fletcherOptions;

  const options: FLETCH.FetchOptions = {
    data: body,
    responseEncoding: encoding,
    headers,
    maxRedirects: maxRedirections,
    method,
    responseType: 'text',
  };

  if (validateStatus) {
    options.validateStatus = validateStatus;
  }

  if (options.maxRedirects === 0) {
    options.validateStatus =
      validateStatus || ((statusCode) => statusCode >= 200 && statusCode < 400);
  }

  if (typeof rejectUnauthorized !== 'undefined' && !proxy) {
    options.httpsAgent = new https.Agent({ rejectUnauthorized });
  }

  if (proxy) {
    const { username, password, host, port, protocol = 'http' } = proxy;

    options.httpsAgent = HttpsProxyAgent({
      auth: `${username}:${password}`,
      host,
      port,
      protocol,
      rejectUnauthorized: rejectUnauthorized ?? false,
    });
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
