import puppeteer from 'puppeteer-core';
import $ from 'cheerio';

import type { FletcherUserOptions } from '../fletcher';
import { getScript } from './script';
import Cache from './cache';

type ExecutorFn<T = unknown> = (page: puppeteer.Page) => Promise<T>;

const cache = new Cache();

async function fetch<T>(
  executor: ExecutorFn<T>,
  options: Partial<FletcherUserOptions> = {}
) {
  const { browserWSEndpoint, userAgent } = options;

  let browser: puppeteer.Browser;
  if (browserWSEndpoint) {
    browser = await puppeteer.connect({
      browserWSEndpoint,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
  }

  if (!browser) throw new Error("Can't launch puppeteer");

  const page = await browser.newPage();
  if (userAgent) {
    page.setUserAgent(userAgent);
  }

  const blockedResourceTypes = ['stylesheet', 'image', 'font', 'media'];
  const blockedResourceTypesRg = new RegExp(blockedResourceTypes.join('|'));
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (blockedResourceTypesRg.test(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const res = await executor(page);
  await page.close();
  await browser.close();

  return res;
}

async function html(
  url: string,
  options: Partial<FletcherUserOptions> = {}
): Promise<cheerio.Cheerio> {
  const cacheParams = { format: 'html', url, options };

  const executor = async (page: puppeteer.Page) => {
    await page.goto(url, {
      timeout: 0,
      waitUntil: 'networkidle0',
    });

    const src = await page.content();
    cache.write({ ...cacheParams, payload: src });

    return $.load(src).root();
  };

  const hit = cache.hit(cacheParams);
  if (hit) return $.load(hit).root();

  return fetch(executor, options);
}

async function json<T>(
  pageUrl: string,
  requestUrl: string | RegExp,
  options: Partial<FletcherUserOptions> = {}
): Promise<T> {
  const cacheParams = {
    format: 'json',
    url: pageUrl,
    options: { requestUrl, ...options },
  };

  const executor = (page: puppeteer.Page): Promise<T> =>
    new Promise((resolve) => {
      const store = new Proxy(
        { data: null },
        {
          set: (obj, prop, value): boolean => {
            cache.write({ ...cacheParams, payload: JSON.stringify(value) });
            resolve(value as T);

            return true;
          },
        }
      );

      page.on('response', async (response) => {
        const url = response.url();
        if (requestUrl instanceof RegExp && !requestUrl.test(url)) return;
        if (typeof requestUrl === 'string' && url !== requestUrl) return;

        store.data = await response.json();
      });

      page.goto(pageUrl);
    });

  const hit = cache.hit(cacheParams);
  if (hit) return JSON.parse(hit);

  return fetch<T>(executor, options);
}

async function script<T>(url: string, options: Partial<FletcherUserOptions>) {
  const $page = await html(url, options);
  return getScript<T>($page, options);
}

export default { json, html, script };
