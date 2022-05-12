/* eslint-disable class-methods-use-this */
import { md5 } from '../lib/md5';
import { sortObject } from '../lib/sort-object';
import type { CacheParams } from '../fletcher.d';

export default class Cache {
  db = new Map();

  hit = <T = string>(params: CacheParams): null | T => {
    const { options } = params;
    if (!options?.cache) return null;

    const key = this.key(params);

    const { cacheMethods } = options;
    if (cacheMethods?.hit) {
      return cacheMethods.hit(key) as T;
    }

    if (this.db.has(key)) {
      return this.db.get(key) as T;
    }

    return null;
  };

  write = (params: CacheParams): void => {
    const { options } = params;
    if (!options?.cache) return;

    const { payload, ...cacheParams } = params;
    const key = this.key(cacheParams);

    const { cacheMethods } = options;
    if (cacheMethods?.write) {
      cacheMethods.write(key, payload);
      return;
    }

    this.db.set(key, payload);
  };

  key = (params: CacheParams): string => {
    const { format, url, options } = params;

    const { cacheMethods } = options || {};
    if (cacheMethods?.key) {
      return cacheMethods.key(params);
    }

    const seed = [format, url, JSON.stringify(sortObject(params))]
      .filter(Boolean)
      .join('');

    return md5(seed);
  };
}
