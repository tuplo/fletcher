import puppeteer from "puppeteer-core";
import $ from "cheerio";

import type {
	FletcherUserOptions,
	FletcherBrowserUserOptions,
} from "src/fletcher.d";

import { getScript } from "../options/script";
import { getJsonLd } from "../options/json-ld";
import Cache from "../options/cache";

type ExecutorFn<T = unknown> = (page: puppeteer.Page) => Promise<T>;

const cache = new Cache();

let browser: puppeteer.Browser | null = null;

async function fetch<T>(
	executor: ExecutorFn<T>,
	options: Partial<FletcherUserOptions> = {}
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

	const { blockedResourceTypes } = browserOptions as FletcherBrowserUserOptions;
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
		page.on("request", async (request) => {
			if (rgBlockedResourceTypesRg.test(request.resourceType())) {
				request.abort();
			} else {
				request.continue();
			}
		});
	}

	const res = await executor(page);
	await page.close();

	return res;
}

async function html(
	url: string,
	options: Partial<FletcherUserOptions> = {}
): Promise<cheerio.Cheerio> {
	const { browser: browserOptions } = options;

	if (options?.log) {
		// eslint-disable-next-line no-console
		console.error(url);
	}

	const cacheParams = { format: "html", url, options };

	const executor = async (page: puppeteer.Page) => {
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

	return fetch(executor, options);
}

async function json<T>(
	pageUrl: string,
	requestUrl: string | RegExp,
	options: Partial<FletcherUserOptions> = {}
): Promise<T> {
	const cacheParams = {
		format: "json",
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

	return fetch<T>(executor, options);
}

async function script<T>(url: string, options: Partial<FletcherUserOptions>) {
	const $page = await html(url, options);
	return getScript<T>($page, options);
}

async function jsonld<T>(url: string, options: Partial<FletcherUserOptions>) {
	const $page = await html(url, options);
	return getJsonLd<T>($page);
}

async function close() {
	if (!browser) return;

	await browser.close();
	browser = null;
}

export default { json, html, script, jsonld, close };
