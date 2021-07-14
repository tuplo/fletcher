import fetch from 'node-fetch';
import $ from 'cheerio';
import vm from 'vm';
import retry from 'async-retry';
import deepMerge from 'deepmerge';

import type { Response } from 'node-fetch';

import type { FletchUserOptions, Instance } from './fletch.d';
import fromUserOptions from './options';
import { delay, hashRequest } from './helpers';

const cache = new Map();

function fletch(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<Response> {
  const {
    url,
    delay: delayMs,
    retry: retryOptions,
    validateStatus,
    ...options
  } = fromUserOptions(userUrl, userOptions);

  return delay<Response>(delayMs, () =>
    retry(async () => {
      let res: Response | null = null;
      try {
        res = await fetch(url, options);
        if (!validateStatus(res.status)) {
          throw Error(res.statusText);
        }

        return res;
      } catch (err) {
        if (!res) throw Error(err);

        if (!validateStatus(res.status)) {
          throw Error(res.statusText);
        }
        return res;
      }
    }, retryOptions)
  );
}

async function text(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<string> {
  const hash = hashRequest('text', userUrl, userOptions);
  if (cache.has(hash)) {
    return cache.get(hash);
  }

  const res = await fletch(userUrl, userOptions).then((r) => r.text());
  cache.set(hash, res);

  return res;
}

async function html(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<cheerio.Cheerio> {
  const hash = hashRequest('html', userUrl, userOptions);
  if (cache.has(hash)) {
    return $.load(cache.get(hash)).root();
  }

  const src = await fletch(userUrl, userOptions).then((res) => res.text());
  cache.set(hash, src);

  return $.load(src).root();
}

async function json<T = unknown>(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<T> {
  const hash = hashRequest('json', userUrl, userOptions);
  if (cache.has(hash)) {
    return JSON.parse(cache.get(hash));
  }

  const src = await fletch(userUrl, userOptions).then((res) => res.json());
  cache.set(hash, JSON.stringify(src));

  return src;
}

async function script<T extends unknown = unknown>(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<T> {
  const { scriptPath, scriptFindFn, scriptSandbox } =
    userOptions || ({} as FletchUserOptions);
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

export type FletchInstance = Instance;

function create(defaultOptions: Partial<FletchUserOptions> = {}): Instance {
  return {
    text: (url: string, options: Partial<FletchUserOptions> = {}) =>
      text(url, deepMerge(defaultOptions, options)),
    html: (url: string, options: Partial<FletchUserOptions> = {}) =>
      html(url, deepMerge(defaultOptions, options)),
    script: <T = unknown>(
      url: string,
      options: Partial<FletchUserOptions> = {}
    ) => script<T>(url, deepMerge(defaultOptions, options)),
    json: <T = unknown>(
      url: string,
      options: Partial<FletchUserOptions> = {}
    ) => json<T>(url, deepMerge(defaultOptions, options)),
  };
}

export default Object.assign(fetch, { text, html, script, json, create });
