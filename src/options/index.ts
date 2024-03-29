/* eslint-disable no-case-declarations */
import { type Method } from "axios";

import {
	type IFletcherOptions,
	type IFletcherUserOptions,
	type IOnAfterRequestFn,
	type IProxyConfig,
} from "../fletcher.d";
import { type IOptions as RetryOptions } from "../helpers/async-retry";

export function getDefaultOptions(
	url = "http://foo.com"
): Omit<IFletcherOptions, "url"> {
	return {
		cache: false,
		delay: process.env.NODE_ENV === "test" ? 0 : 1_000,
		encoding: "utf8",
		headers: {
			referer: new URL(url).origin,
		},
		method: "GET",
		retry: {
			retries: 10,
			factor: 2,
			minTimeout: 1_000,
			maxTimeout: Infinity,
			randomize: true,
		},
		timeout: 30_000,
		validateStatus: (status: number): boolean => status >= 200 && status < 400,
	};
}

export function toFletcherOptions(
	url: string,
	options?: Partial<IFletcherUserOptions>
) {
	return Object.entries(options || {}).reduce(
		(acc, [key, value]) => {
			switch (key) {
				case "cache":
					acc.cache = Boolean(value);
					break;
				case "delay":
					acc.delay = Number(value);
					break;
				case "encoding":
					acc.encoding = value as BufferEncoding;
					break;
				case "formData":
				case "formUrlEncoded":
					acc.method = "POST";
					acc.headers = {
						...acc.headers,
						"content-type": "application/x-www-form-urlencoded",
					};
					const sp = new URLSearchParams(value as Record<string, string>);
					acc.body = sp.toString();
					break;
				case "headers":
					acc.headers = {
						...(acc.headers || {}),
						...((value || {}) as Record<string, string>),
					};
					break;
				case "jsonData":
					acc.headers = {
						...acc.headers,
						"content-type": "application/json",
					};
					acc.method = "POST";
					acc.body = JSON.stringify(value);
					break;
				case "maxRedirections":
					acc.maxRedirections = Number(value);
					break;
				case "method":
					acc.method = value.toString() as Method;
					break;
				case "onAfterRequest":
					acc.onAfterRequest = value as IOnAfterRequestFn;
					break;
				case "proxy":
					acc.proxy = value as IProxyConfig;
					break;
				case "rejectUnauthorized":
					acc.rejectUnauthorized = Boolean(value);
					break;
				case "retry":
					if (value === false) {
						acc.retry = {
							retries: 0,
						};
					} else if (typeof value === "number") {
						acc.retry = {
							...acc.retry,
							retries: value,
						};
					} else if (typeof value === "object") {
						acc.retry = value as RetryOptions;
					}
					break;
				case "timeout":
					acc.timeout = Number(value);
					break;
				case "urlSearchParams":
					const newUrl = new URL(url);
					newUrl.search = new URLSearchParams(value as string).toString();
					acc.url = newUrl.href;
					break;
				case "userAgent":
					acc.headers = {
						...(acc.headers || {}),
						"user-agent": value.toString(),
					};
					break;
				case "validateStatus":
					const validateFn = value as (status: number) => boolean;
					acc.validateStatus = validateFn ?? acc.validateStatus;
					break;
				default:
			}

			return acc;
		},
		{
			...getDefaultOptions(url),
			url,
		} as IFletcherOptions
	);
}
