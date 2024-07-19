/* eslint-disable no-case-declarations */
import { type Method } from "axios";

import type {
	IFletcherOptions,
	IFletcherUserOptions,
	IOnAfterRequestFn,
	IProxyConfig,
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
			factor: 2,
			maxTimeout: Infinity,
			minTimeout: 1_000,
			randomize: true,
			retries: 10,
		},
		timeout: 30_000,
		validateStatus: (status: number): boolean => status >= 200 && status < 400,
	};
}

export function toFletcherOptions(
	url: string,
	options?: Partial<IFletcherUserOptions>
) {
	const opts = {
		...getDefaultOptions(url),
		url,
	} as IFletcherOptions;

	for (const entry of Object.entries(options || {})) {
		const [key, value] = entry;

		switch (key) {
			case "cache": {
				opts.cache = Boolean(value);
				break;
			}
			case "delay": {
				opts.delay = Number(value);
				break;
			}
			case "encoding": {
				opts.encoding = value as BufferEncoding;
				break;
			}
			case "formData":
			case "formUrlEncoded": {
				opts.method = "POST";
				opts.headers = {
					...opts.headers,
					"content-type": "application/x-www-form-urlencoded",
				};
				const sp = new URLSearchParams(value as Record<string, string>);
				opts.body = sp.toString();
				break;
			}
			case "headers": {
				opts.headers = {
					...opts.headers,
					...((value || {}) as Record<string, string>),
				};
				break;
			}
			case "jsonData": {
				opts.headers = {
					...opts.headers,
					"content-type": "application/json",
				};
				opts.method = "POST";
				opts.body = JSON.stringify(value);
				break;
			}
			case "maxRedirections": {
				opts.maxRedirections = Number(value);
				break;
			}
			case "method": {
				opts.method = value.toString() as Method;
				break;
			}
			case "onAfterRequest": {
				opts.onAfterRequest = value as IOnAfterRequestFn;
				break;
			}
			case "proxy": {
				opts.proxy = value as IProxyConfig;
				break;
			}
			case "rejectUnauthorized": {
				opts.rejectUnauthorized = Boolean(value);
				break;
			}
			case "retry": {
				if (value === false) {
					opts.retry = {
						retries: 0,
					};
				} else if (typeof value === "number") {
					opts.retry = {
						...opts.retry,
						retries: value,
					};
				} else if (typeof value === "object") {
					opts.retry = value as RetryOptions;
				}
				break;
			}
			case "timeout": {
				opts.timeout = Number(value);
				break;
			}
			case "urlSearchParams": {
				const newUrl = new URL(url);
				newUrl.search = new URLSearchParams(value as string).toString();
				opts.url = newUrl.href;
				break;
			}
			case "userAgent": {
				opts.headers = {
					...opts.headers,
					"user-agent": value.toString(),
				};
				break;
			}
			case "validateStatus": {
				const validateFn = value as (status: number) => boolean;
				opts.validateStatus = validateFn ?? opts.validateStatus;
				break;
			}
			default:
		}
	}

	return opts;
}
