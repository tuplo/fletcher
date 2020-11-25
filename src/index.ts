import fetch from 'node-fetch';
import $ from 'cheerio';
import vm from 'vm';

import type { Response } from 'node-fetch';

import type { FletchUserOptions } from './fletch.d';
import fromUserOptions from './options';

type Fletch = (
  url: string,
  userOptions?: FletchUserOptions
) => Promise<Response>;
const fletch: Fletch = async (userUrl, userOptions) => {
  const { url, ...options } = fromUserOptions(userUrl, userOptions);

  return fetch(url, options);
};

type FletchTextFn = (
  url: string,
  options?: FletchUserOptions
) => Promise<string>;
export const text: FletchTextFn = async (url, options) => {
  return fletch(url, options).then((res) => res.text());
};

type FletchHtmlFn = (
  url: string,
  options?: FletchUserOptions
) => Promise<cheerio.Cheerio>;
export const html: FletchHtmlFn = async (url, options) => {
  const src = await fletch(url, options).then((res) => res.text());
  return $.load(src).root();
};

export async function script<T extends unknown = unknown>(
  url: string,
  options?: FletchUserOptions
): Promise<T> {
  const { scriptPath, scriptFindFn, scriptSandbox } =
    options || ({} as FletchUserOptions);
  if (!scriptPath && !scriptFindFn)
    throw new Error('fletch.script: scriptPath or scriptFindFn are required');

  const $page = await html(url, options);
  let $el: cheerio.Cheerio | null | undefined = null;
  if (scriptPath) {
    $el = $page.find(scriptPath);
  } else if (scriptFindFn) {
    $el = $(scriptFindFn($page));
  }

  if (!$el) {
    throw new Error('fletch.script: script element not found');
  }

  const src = $el.html() || '';
  if (!src) {
    throw new Error('fletch.script: script element is empty');
  }

  const code = new vm.Script(src);
  const sandbox = scriptSandbox || {};
  vm.createContext(sandbox);
  code.runInContext(sandbox, { displayErrors: false });

  return sandbox as T;
}

export default fetch;
