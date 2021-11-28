import fetch from 'node-fetch';
import $ from 'cheerio';
import vm from 'vm';
import retry from 'async-retry';
import deepMerge from 'deepmerge';

import type { Response } from 'node-fetch';

import type { FletcherUserOptions, Instance, ProxyConfig } from './fletcher.d';
import fromUserOptions from './options';
import { delay, hashRequest, decodeEncoding } from './helpers';
import browser from './browser';

const cache = new Map();

function fletcher(
  userUrl: string,
  userOptions?: Partial<FletcherUserOptions>
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
  userOptions?: Partial<FletcherUserOptions>
): Promise<string> {
  const res = fletcher(url, userOptions);
  return decodeEncoding(res, userOptions?.encoding);
}

async function text(
  userUrl: string,
  userOptions?: Partial<FletcherUserOptions>
): Promise<string> {
  const hash = hashRequest('text', userUrl, userOptions);
  if (userOptions?.cache && cache.has(hash)) {
    return cache.get(hash);
  }

  const res = await decfletcher(userUrl, userOptions);
  if (userOptions?.cache) {
    cache.set(hash, res);
  }

  return res;
}

async function html(
  userUrl: string,
  userOptions?: Partial<FletcherUserOptions>
): Promise<cheerio.Cheerio> {
  const hash = hashRequest('html', userUrl, userOptions);
  if (userOptions?.cache && cache.has(hash)) {
    return $.load(cache.get(hash)).root();
  }

  const src = await decfletcher(userUrl, userOptions);
  if (userOptions?.cache) {
    cache.set(hash, src);
  }

  return $.load(src).root();
}

async function json<T = unknown>(
  userUrl: string,
  userOptions?: Partial<FletcherUserOptions>
): Promise<T> {
  const hash = hashRequest('json', userUrl, userOptions);
  if (userOptions?.cache && cache.has(hash)) {
    return JSON.parse(cache.get(hash));
  }

  const res = await decfletcher(userUrl, userOptions);
  const src = JSON.parse(res);
  if (userOptions?.cache) {
    cache.set(hash, JSON.stringify(src));
  }

  return src;
}

async function script<T = unknown>(
  userUrl: string,
  userOptions?: Partial<FletcherUserOptions>
): Promise<T> {
  const { scriptPath, scriptFindFn, scriptSandbox } =
    userOptions || ({} as FletcherUserOptions);
  if (!scriptPath && !scriptFindFn)
    throw new Error('fletch.script: scriptPath or scriptFindFn are required');

  const $page = await html(userUrl, userOptions);
  let $el: cheerio.Cheerio | null | undefined = null;
  if (scriptPath) {
    $el = $page.find(scriptPath);
  } else if (scriptFindFn) {
    const elScript = $page.find('script').toArray().find(scriptFindFn);
    $el = $(elScript);
  }

  if (!$el) {
    throw new Error('fletch.script: script element not found');
  }

  const src = $el.html() || '';
  const code = new vm.Script(src);
  const sandbox = scriptSandbox || {};
  vm.createContext(sandbox);
  code.runInContext(sandbox, { displayErrors: false });

  return sandbox as T;
}

async function jsonld(
  userUrl: string,
  userOptions?: Partial<FletcherUserOptions>
): Promise<unknown[]> {
  const $page = await html(userUrl, userOptions);
  return $page
    .find('script[type="application/ld+json"]')
    .toArray()
    .map((el) => {
      const $el = $(el);
      // make sure no new lines inside values
      const src = ($el.html() || '').split('\n').join(' ');
      try {
        return JSON.parse(src);
      } catch (err) {
        return {};
      }
    });
}

export type FletcherInstance = Instance;
export type FletcherProxyConfig = ProxyConfig;

function create(defaultOptions: Partial<FletcherUserOptions> = {}): Instance {
  return {
    text: (url: string, options: Partial<FletcherUserOptions> = {}) =>
      text(url, deepMerge(defaultOptions, options)),
    html: (url: string, options: Partial<FletcherUserOptions> = {}) =>
      html(url, deepMerge(defaultOptions, options)),
    script: <T = unknown>(
      url: string,
      options: Partial<FletcherUserOptions> = {}
    ) => script<T>(url, deepMerge(defaultOptions, options)),
    json: <T = unknown>(
      url: string,
      options: Partial<FletcherUserOptions> = {}
    ) => json<T>(url, deepMerge(defaultOptions, options)),
    jsonld: (url: string, options: Partial<FletcherUserOptions> = {}) =>
      jsonld(url, deepMerge(defaultOptions, options)),
    browser: {
      html: (
        url: string,
        options: Partial<FletcherUserOptions> = {}
      ): Promise<cheerio.Cheerio> =>
        browser.html(url, deepMerge(defaultOptions, options)),
      json: <T>(
        pageUrl: string,
        requestUrl: string | RegExp,
        options: Partial<FletcherUserOptions> = {}
      ): Promise<T> =>
        browser.json(pageUrl, requestUrl, deepMerge(defaultOptions, options)),
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
