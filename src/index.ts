import fetch from 'node-fetch';
import $ from 'cheerio';
import vm from 'vm';

import type { Response } from 'node-fetch';

import type { FletchUserOptions } from './fletch.d';
import fromUserOptions from './options';

function fletch(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<Response> {
  const { url, ...options } = fromUserOptions(userUrl, userOptions);

  return fetch(url, options);
}

async function text(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<string> {
  return fletch(userUrl, userOptions).then((res) => res.text());
}

async function html(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<cheerio.Cheerio> {
  const src = await fletch(userUrl, userOptions).then((res) => res.text());

  return $.load(src).root();
}

async function json<T = unknown>(
  userUrl: string,
  userOptions?: Partial<FletchUserOptions>
): Promise<T> {
  const src = await fletch(userUrl, userOptions).then((res) => res.json());

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

export default Object.assign(fetch, { text, html, script, json });
