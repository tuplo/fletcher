/* eslint-disable no-console */
import $, { type AnyNode, type Cheerio } from "cheerio";
import deepMerge from "deepmerge";

import browser from "./services/browser";
import { request } from "./services/request";

import { retry } from "./helpers/async-retry";
import { delay } from "./helpers/delay";
import { text2json } from "./helpers/text2json";
import { CookieJar } from "./helpers/cookie-jar";

import { toFletcherOptions } from "./options";
import { Cache } from "./options/cache";
import { getEmbeddedJson } from "./options/embedded-json";
import { getJsonLd } from "./options/json-ld";
import { getScript } from "./options/script";

import type { IFletcherUserOptions, IInstance, IResponse } from "./fletcher.d";

export type {
	ICacheParams,
	IInstance,
	IProxyConfig,
	IFletcherUserOptions as IUserOptions,
	ICookie,
	CookieJar,
} from "./fletcher.d";

const cache = new Cache();

function fletcher(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
): Promise<IResponse> {
	const options = toFletcherOptions(userUrl, userOptions);
	const {
		url,
		delay: delayMs = 0,
		validateStatus,
		retry: retryOptions,
	} = options;

	if (userOptions?.log) {
		console.error(url);
	}

	return delay<IResponse>(delayMs, () =>
		retry(async () => {
			let res: IResponse | undefined;
			try {
				res = await request(url, options);
				if (!validateStatus(res.statusCode)) {
					throw Error(`${res.statusCode}: ${res.statusMessage}`);
				}

				return res;
			} catch (err: unknown) {
				if (userOptions?.log) {
					console.error(err);
				}

				if (!res) throw Error(err as string);

				if (!validateStatus(res.statusCode)) {
					throw Error(`${res.statusCode}: ${res.statusMessage}`);
				}

				return res;
			}
		}, retryOptions)
	);
}

async function text(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const cacheParams = { url: userUrl, options: userOptions, format: "text" };
	const hit = cache.hit<string>(cacheParams);
	if (hit) return hit;

	const data = await fletcher(userUrl, userOptions).then((res) => res.text());
	cache.write({ ...cacheParams, payload: data });

	return data;
}

async function html(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const cacheParams = { format: "html", url: userUrl, options: userOptions };
	const hit = cache.hit(cacheParams);
	if (hit) return $.load(hit).root();

	const src = await fletcher(userUrl, userOptions).then((res) => res.text());
	cache.write({ ...cacheParams, payload: src });

	return $.load(src).root();
}

async function json<T = unknown>(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
): Promise<T> {
	const cacheParams = { format: "json", url: userUrl, options: userOptions };
	const hit = cache.hit(cacheParams);
	if (hit) return JSON.parse(hit);

	const raw = await fletcher(userUrl, userOptions).then((res) => res.text());
	const src = text2json(raw);
	cache.write({ ...cacheParams, payload: JSON.stringify(src) });

	return src;
}

async function script<T = unknown>(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const $page = await html(userUrl, userOptions);
	return getScript<T>($page, userOptions);
}

async function jsonld(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const $page = await html(userUrl, userOptions);
	return getJsonLd($page);
}

async function headers(
	url: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const res = await fletcher(url, userOptions);
	return res.headers;
}

async function cookies(
	url: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const res = await fletcher(url, userOptions);
	const { "set-cookie": setCookies } = res.headers;

	const jar = new CookieJar();
	jar.setCookies(setCookies);

	return jar;
}

async function embeddedJson(
	userUrl: string,
	userOptions?: Partial<IFletcherUserOptions>
) {
	const $page = await html(userUrl, userOptions);
	return getEmbeddedJson($page, userOptions);
}

function create(defaultOptions: Partial<IFletcherUserOptions> = {}) {
	return {
		embeddedJson: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			embeddedJson(url, deepMerge(defaultOptions, options)),
		headers: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			headers(url, deepMerge(defaultOptions, options)),
		cookies: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			cookies(url, deepMerge(defaultOptions, options)),
		html: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			html(url, deepMerge(defaultOptions, options)),
		json: <T = unknown>(
			url: string,
			options: Partial<IFletcherUserOptions> = {}
		) => json<T>(url, deepMerge(defaultOptions, options)),
		jsonld: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			jsonld(url, deepMerge(defaultOptions, options)),
		response: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			fletcher(url, deepMerge(defaultOptions, options)),
		script: <T = unknown>(
			url: string,
			options: Partial<IFletcherUserOptions> = {}
		) => script<T>(url, deepMerge(defaultOptions, options)),
		text: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
			text(url, deepMerge(defaultOptions, options)),
		browser: {
			close: () => browser.close(),
			html: (
				url: string,
				options: Partial<IFletcherUserOptions> = {}
			): Promise<Cheerio<AnyNode>> =>
				browser.html(url, deepMerge(defaultOptions, options)),
			json: <T>(
				pageUrl: string,
				requestUrl: string | RegExp,
				options: Partial<IFletcherUserOptions> = {}
			): Promise<T> =>
				browser.json(pageUrl, requestUrl, deepMerge(defaultOptions, options)),
			script: <T>(url: string, options: Partial<IFletcherUserOptions> = {}) =>
				browser.script<T>(url, deepMerge(defaultOptions, options)),
			jsonld: (url: string, options: Partial<IFletcherUserOptions> = {}) =>
				browser.jsonld(url, deepMerge(defaultOptions, options)),
		},
	} as IInstance;
}

export default Object.assign(fletcher, {
	browser,
	cookies,
	create,
	embeddedJson,
	headers,
	html,
	json,
	jsonld,
	response: fletcher,
	script,
	text,
});
