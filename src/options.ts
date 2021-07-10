/* eslint-disable no-case-declarations */
import { URL, URLSearchParams } from 'url';
import ProxyAgent from 'https-proxy-agent';

import type { HeadersInit } from 'node-fetch';
import type { Options as RetryOptions } from 'async-retry';

import type {
  FletchUserOptions,
  FletchOptions,
  ProxyOptions,
} from './fletch.d';

export function getDefaultOptions(
  url = 'http://foo.com'
): Omit<FletchOptions, 'url'> {
  return {
    delay: process.env.NODE_ENV === 'test' ? 0 : 1_000,
    headers: {
      referer: new URL(url).origin,
      host: new URL(url).hostname,
    },
    retry: {
      retries: 10,
      factor: 2,
      minTimeout: 1_000,
      maxTimeout: Infinity,
      randomize: true,
    },
    validateStatus: (status: number): boolean => status >= 200 && status < 400,
  };
}

function fromUserOptions(
  url: string,
  options?: Partial<FletchUserOptions>
): FletchOptions {
  return Object.entries(options || {}).reduce(
    (acc, [key, value]) => {
      switch (key) {
        case 'delay':
          acc.delay = Number(value);
          break;
        case 'headers':
          acc.headers = {
            ...(acc.headers || {}),
            ...((value || {}) as HeadersInit),
          };
          break;
        case 'proxy':
          if (typeof value === 'undefined') break;
          const { host, port, username, password } = value as ProxyOptions;
          acc.agent = ProxyAgent(
            `http://${username}:${password}@${host}:${port}`
          );
          break;
        case 'retry':
          if (value === false) {
            acc.retry = {
              retries: 0,
            };
          } else if (typeof value === 'number') {
            acc.retry = {
              ...acc.retry,
              retries: value,
            };
          } else if (typeof value === 'object') {
            acc.retry = value as RetryOptions;
          }
          break;
        case 'urlSearchParams':
          const newUrl = new URL(url);
          newUrl.search = new URLSearchParams(value as string).toString();
          acc.url = newUrl.href;
          break;
        case 'validateStatus':
          const validateFn = value as (status: number) => boolean;
          acc.validateStatus = validateFn ?? acc.validateStatus;
          break;
        default:
      }

      return acc;
    },
    {
      url,
      ...getDefaultOptions(url),
    } as FletchOptions
  );
}

export default fromUserOptions;
