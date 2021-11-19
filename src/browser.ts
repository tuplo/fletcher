import puppeteer from 'puppeteer-core';
import $ from 'cheerio';

type ExecutorFn<T = unknown> = (page: puppeteer.Page) => Promise<T>;

async function fetch<T>(executor: ExecutorFn<T>) {
  let browser: puppeteer.Browser;
  if ('BROWSERLESS_API_KEY' in process.env) {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
    });
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
  }

  if (!browser) throw new Error("Can't launch puppeteer");

  const page = await browser.newPage();

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

async function html(url: string): Promise<cheerio.Cheerio> {
  return fetch(async (page) => {
    await page.goto(url, {
      timeout: 0,
      waitUntil: 'networkidle0',
    });
    const src = await page.content();
    return $.load(src).root();
  }) as Promise<cheerio.Cheerio>;
}

async function json<T>(
  pageUrl: string,
  requestUrl: string | RegExp
): Promise<T> {
  return fetch(
    (page) =>
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
      })
  );
}

export default { json, html };
