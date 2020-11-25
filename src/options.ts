/* eslint-disable no-case-declarations */
import { URL, URLSearchParams } from 'url';

import type { FletchUserOptions, FletchOptions } from './fletch.d';

type FromUserOptionsFn = (
  url: string,
  options?: FletchUserOptions
) => FletchOptions;
const fromUserOptions: FromUserOptionsFn = (url, options?) => {
  return Object.entries(options || {}).reduce(
    (acc, [key, value]) => {
      switch (key) {
        case 'urlSearchParams':
          const newUrl = new URL(url);
          newUrl.search = new URLSearchParams(value as string).toString();
          acc.url = newUrl.href;
          break;
        default:
      }

      return acc;
    },
    { url } as FletchOptions
  );
};

export default fromUserOptions;
