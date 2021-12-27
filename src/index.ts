import fetch from 'node-fetch';
import $ from 'cheerio';
import retry from 'async-retry';
import deepMerge from 'deepmerge';
import type { Response } from 'node-fetch';

import type * as FLETCH from './fletcher.d';
import fromUserOptions from './options';
import { getScript } from './options/script';
import { getJsonLd } from './options/json-ld';
import { delay, decodeEncoding } from './helpers';
import browser from './options/browser';
import Cache from './options/cache';

const cache = new Cache();

function fletcher(
  userUrl: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<Response> {
  const {
    url,
    delay: delayMs = 0,
    retry: retryOptions,
    validateStatus,
    ...options
  } = fromUserOptions(userUrl, userOptions);

  if (userOptions?.log) {
    // eslint-disable-next-line no-console
    console.error(url);
  }

  return delay<Response>(delayMs, () =>
    retry(async () => {
      let res: Response | null = null;
      try {
        res = await fetch(url, options);
        if (!validateStatus(res.status)) {
          throw Error(res.statusText);
        }

        return res;
      } catch (err: unknown) {
        if (userOptions?.log) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
        if (!res) throw Error(err as string);

        if (!validateStatus(res.status)) {
          throw Error(res.statusText);
        }
        return res;
      }
    }, retryOptions)
  );
}

async function decfletcher(
  url: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<string> {
  const res = fletcher(url, userOptions);
  return decodeEncoding(res, userOptions?.encoding);
}

async function text(
  userUrl: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<string> {
  const cacheParams = { format: 'text', url: userUrl, options: userOptions };
  const hit = cache.hit<string>(cacheParams);
  if (hit) return hit;

  const res = await decfletcher(userUrl, userOptions);
  cache.write({ ...cacheParams, payload: res });

  return res;
}

async function html(
  userUrl: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<cheerio.Cheerio> {
  const cacheParams = { format: 'html', url: userUrl, options: userOptions };
  const hit = cache.hit(cacheParams);
  if (hit) return $.load(hit).root();

  const src = await decfletcher(userUrl, userOptions);
  cache.write({ ...cacheParams, payload: src });

  return $.load(src).root();
}

async function json<T = unknown>(
  userUrl: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<T> {
  const cacheParams = { format: 'json', url: userUrl, options: userOptions };
  const hit = cache.hit(cacheParams);
  if (hit) return JSON.parse(hit);

  const res = await decfletcher(userUrl, userOptions);
  const src = JSON.parse(res);
  cache.write({ ...cacheParams, payload: JSON.stringify(src) });

  return src;
}

async function script<T = unknown>(
  userUrl: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<T> {
  const $page = await html(userUrl, userOptions);
  return getScript<T>($page, userOptions);
}

async function jsonld(
  userUrl: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<unknown[]> {
  const $page = await html(userUrl, userOptions);
  return getJsonLd($page);
}

async function headers(
  url: string,
  userOptions?: Partial<FLETCH.FletcherUserOptions>
): Promise<FLETCH.Headers> {
  const res = await fletcher(url, userOptions);
  return Object.fromEntries(res.headers.entries());
}

export type FletcherInstance = FLETCH.Instance;
export type FletcherProxyConfig = FLETCH.ProxyConfig;

function create(
  defaultOptions: Partial<FLETCH.FletcherUserOptions> = {}
): FLETCH.Instance {
  return {
    headers: (url: string, options: Partial<FLETCH.FletcherUserOptions> = {}) =>
      headers(url, deepMerge(defaultOptions, options)),
    html: (url: string, options: Partial<FLETCH.FletcherUserOptions> = {}) =>
      html(url, deepMerge(defaultOptions, options)),
    json: <T = unknown>(
      url: string,
      options: Partial<FLETCH.FletcherUserOptions> = {}
    ) => json<T>(url, deepMerge(defaultOptions, options)),
    jsonld: (url: string, options: Partial<FLETCH.FletcherUserOptions> = {}) =>
      jsonld(url, deepMerge(defaultOptions, options)),
    script: <T = unknown>(
      url: string,
      options: Partial<FLETCH.FletcherUserOptions> = {}
    ) => script<T>(url, deepMerge(defaultOptions, options)),
    text: (url: string, options: Partial<FLETCH.FletcherUserOptions> = {}) =>
      text(url, deepMerge(defaultOptions, options)),
    browser: {
      close: () => browser.close(),
      html: (
        url: string,
        options: Partial<FLETCH.FletcherUserOptions> = {}
      ): Promise<cheerio.Cheerio> =>
        browser.html(url, deepMerge(defaultOptions, options)),
      json: <T>(
        pageUrl: string,
        requestUrl: string | RegExp,
        options: Partial<FLETCH.FletcherUserOptions> = {}
      ): Promise<T> =>
        browser.json(pageUrl, requestUrl, deepMerge(defaultOptions, options)),
      script: <T>(
        url: string,
        options: Partial<FLETCH.FletcherUserOptions> = {}
      ) => browser.script<T>(url, deepMerge(defaultOptions, options)),
      jsonld: (
        url: string,
        options: Partial<FLETCH.FletcherUserOptions> = {}
      ) => browser.jsonld(url, deepMerge(defaultOptions, options)),
    },
  };
}

export default Object.assign(fletcher, {
  text,
  html,
  script,
  json,
  jsonld,
  create,
  browser,
});
