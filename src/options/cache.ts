/* eslint-disable class-methods-use-this */
import md5 from '../helpers/md5';
import serializeObject from '../helpers/serialize-object';
import { FletcherUserOptions } from '../fletcher.d';

type CacheParams = {
  format: string;
  url: string;
  options?: Partial<FletcherUserOptions>;
  payload?: string;
};

export default class Cache {
  db = new Map();

  hit = <T = string>(params: CacheParams): null | T => {
    const { options } = params;
    if (!options?.cache) return null;

    const key = this.key(params);
    if (this.db.has(key)) {
      return this.db.get(key) as T;
    }

    return null;
  };

  write = (params: CacheParams): void => {
    const { options, payload } = params;
    if (!options?.cache) return;

    const key = this.key(params);
    this.db.set(key, payload);
  };

  key = (params: CacheParams): string => {
    const { format, url, options } = params;
    const {
      formData = {},
      formUrlEncoded = {},
      headers = {},
      jsonData = {},
      urlSearchParams = {},
    } = options || {};

    const seed = [
      format,
      url,
      JSON.stringify({
        formData: serializeObject(formData),
        formUrlEncoded: serializeObject(formUrlEncoded),
        headers: serializeObject(headers),
        jsonData: serializeObject(jsonData),
        urlSearchParams: serializeObject(urlSearchParams),
      }),
    ]
      .filter(Boolean)
      .join('');

    return md5(seed);
  };
}
