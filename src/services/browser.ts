import $ from "cheerio";
import type { Browser, Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";

import type {
	IFletcherBrowserUserOptions,
	IFletcherUserOptions,
} from "src/fletcher.d";
import { Cache } from "src/options/cache";
import { getJsonLd } from "src/options/json-ld";
import { getScript } from "src/options/script";

interface IExecutorFn<T = unknown> {
	(page: Page): Promise<T>;
}

const cache = new Cache();

let browser: Browser | null = null;

async function request<T>(
	executor: IExecutorFn<T>,
	options: Partial<IFletcherUserOptions> = {}
) {
	const { userAgent, proxy } = options;
	const { browser: browserOptions } = options;

	if (!browser) {
		if (browserOptions?.endpoint) {
			browser = await puppeteer.connect({
				browserWSEndpoint: browserOptions.endpoint,
			});
		} else {
			browser = await puppeteer.launch({
				headless: true,
				args: ["--no-sandbox", "--disable-gpu"],
			});
		}
	}

	if (!browser) throw new Error("Can't launch puppeteer");

	const page = await browser.newPage();
	if (userAgent) {
		page.setUserAgent(userAgent);
	}

	if (proxy) {
		const { username = "", password = "" } = proxy;
		await page.authenticate({ username, password });
	}

	const { blockedResourceTypes } =
		browserOptions as IFletcherBrowserUserOptions;
	const shouldBlockResourceTypes =
		typeof blockedResourceTypes === "undefined" ||
		Array.isArray(blockedResourceTypes);
	if (shouldBlockResourceTypes) {
		const blockResourceTypes = blockedResourceTypes || [
			"stylesheet",
			"image",
			"font",
			"media",
		];
		const rgBlockedResourceTypesRg = new RegExp(blockResourceTypes.join("|"));
		await page.setRequestInterception(true);
		page.on("request", async (req) => {
			if (rgBlockedResourceTypesRg.test(req.resourceType())) {
				req.abort();
			} else {
				req.continue();
			}
		});
	}

	const res = await executor(page);
	await page.close();

	return res;
}

async function html(url: string, options: Partial<IFletcherUserOptions> = {}) {
	const { browser: browserOptions } = options;

	if (options?.log) {
		// eslint-disable-next-line no-console
		console.error(url);
	}

	const cacheParams = { format: "html", url, options };

	const executor = async (page: Page) => {
		await page.goto(url, {
			timeout: 0,
			waitUntil: "networkidle0",
		});

		if (browserOptions?.screenshot) {
			await page.screenshot(browserOptions.screenshot);
		}

		if (browserOptions?.waitForSelector) {
			await page.waitForSelector(browserOptions.waitForSelector);
		}

		const src = await page.content();
		cache.write({ ...cacheParams, payload: src });

		return $.load(src).root();
	};

	const hit = cache.hit(cacheParams);
	if (hit) return $.load(hit).root();

	return request(executor, options);
}

async function json<T>(
	pageUrl: string,
	requestUrl: string | RegExp,
	options: Partial<IFletcherUserOptions> = {}
) {
	const cacheParams = {
		format: "json",
		url: pageUrl,
		options: { requestUrl, ...options },
	};

	const executor = (page: Page): Promise<T> =>
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

			page.on("response", async (response) => {
				const url = response.url();
				if (requestUrl instanceof RegExp && !requestUrl.test(url)) return;
				if (typeof requestUrl === "string" && url !== requestUrl) return;

				store.data = await response.json();
			});

			page.goto(pageUrl);
		});

	const hit = cache.hit(cacheParams);
	if (hit) return JSON.parse(hit);

	return request<T>(executor, options);
}

async function script<T>(url: string, options: Partial<IFletcherUserOptions>) {
	const $page = await html(url, options);
	return getScript<T>($page, options);
}

async function jsonld<T>(url: string, options: Partial<IFletcherUserOptions>) {
	const $page = await html(url, options);
	return getJsonLd<T>($page);
}

async function close() {
	if (!browser) return;

	await browser.close();
	browser = null;
}

export default { json, html, script, jsonld, close };
