import $ from "cheerio";
import puppeteer, { type Browser, type Page } from "puppeteer-core";

import {
	type IFletcherBrowserUserOptions,
	type IFletcherUserOptions,
} from "../fletcher.d";
import { Cache } from "../options/cache";
import { getJsonLd } from "../options/json-ld";
import { getScript } from "../options/script";

type IExecutorFn<T = unknown> = {
	(page: Page): Promise<T>;
};

const cache = new Cache();

let browser: Browser | undefined;

async function request<T>(
	executor: IExecutorFn<T>,
	options: Partial<IFletcherUserOptions> = {}
) {
	const { proxy, userAgent } = options;
	const { browser: browserOptions } = options;

	if (!browser) {
		browser = browserOptions?.endpoint
			? await puppeteer.connect({
					browserWSEndpoint: browserOptions.endpoint,
				})
			: await puppeteer.launch({
					args: ["--no-sandbox", "--disable-gpu"],
					headless: true,
				});
	}

	if (!browser) throw new Error("Can't launch puppeteer");

	const page = await browser.newPage();
	if (userAgent) {
		page.setUserAgent(userAgent);
	}

	if (proxy) {
		const { password = "", username = "" } = proxy;
		await page.authenticate({ password, username });
	}

	const { blockedResourceTypes } =
		browserOptions as IFletcherBrowserUserOptions;
	const shouldBlockResourceTypes =
		blockedResourceTypes === undefined || Array.isArray(blockedResourceTypes);
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

	const cacheParams = { format: "html", options, url };

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
	requestUrl: RegExp | string,
	options: Partial<IFletcherUserOptions> = {}
) {
	const cacheParams = {
		format: "json",
		options: { requestUrl, ...options },
		url: pageUrl,
	};

	const executor = (page: Page): Promise<T> =>
		new Promise((resolve) => {
			const store = new Proxy(
				{ data: undefined },
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

			page.goto(pageUrl).then(async () => {
				const { onPageReady } = options.browser || {};
				if (onPageReady) {
					await onPageReady(page);
				}
			});
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
	browser = undefined;
}

export default { close, html, json, jsonld, script };
