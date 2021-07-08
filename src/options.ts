/* eslint-disable no-case-declarations */
import { URL, URLSearchParams } from 'url';
import type { HeadersInit } from 'node-fetch';

import type { FletchUserOptions, FletchOptions } from './fletch.d';

function getDefaultOptions(): Omit<FletchOptions, 'url'> {
  return {
    delay: process.env.NODE_ENV === 'test' ? 0 : 1_000,
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
          acc.headers = value as HeadersInit;
          break;
        case 'urlSearchParams':
          const newUrl = new URL(url);
          newUrl.search = new URLSearchParams(value as string).toString();
          acc.url = newUrl.href;
          break;
        default:
      }

      return acc;
    },
    {
      url,
      ...getDefaultOptions(),
    } as FletchOptions
  );
}

export default fromUserOptions;
