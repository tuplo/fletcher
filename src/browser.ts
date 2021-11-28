import puppeteer from 'puppeteer-core';
import $ from 'cheerio';

import type { FletcherUserOptions } from './fletcher.d';

type ExecutorFn<T = unknown> = (page: puppeteer.Page) => Promise<T>;

async function fetch<T>(
  executor: ExecutorFn<T>,
  options: Partial<FletcherUserOptions> = {}
) {
  const { browserlessEndpoint, userAgent } = options;

  let browser: puppeteer.Browser;
  if (browserlessEndpoint) {
    browser = await puppeteer.connect({
      browserWSEndpoint: browserlessEndpoint,
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
  const executor = async (page: puppeteer.Page) => {
    await page.goto(url, {
      timeout: 0,
      waitUntil: 'networkidle0',
    });
    const src = await page.content();
    const $page = $.load(src).root();
    return $page;
  };

  return fetch(executor, options);
}

async function json<T>(
  pageUrl: string,
  requestUrl: string | RegExp,
  options: Partial<FletcherUserOptions> = {}
): Promise<T> {
  const executor = (page: puppeteer.Page): Promise<T> =>
    new Promise((resolve) => {
      const store = new Proxy(
        { data: null },
        {
          set: (obj, prop, value): boolean => {
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

  return fetch<T>(executor, options);
}

export default { json, html };
