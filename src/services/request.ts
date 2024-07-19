import { STATUS_CODES } from "node:http";

import {
	gotScraping as got,
	type Method,
	type OptionsInit,
	type RequestError,
	type Response,
} from "got-scraping";

import { type IFletcherOptions, type IResponse } from "../fletcher";

function toGotOptions(
	url: string,
	fletcherOptions?: Partial<IFletcherOptions>
) {
	const {
		body,
		encoding,
		headers,
		maxRedirections = 999,
		method = "GET",
		proxy,
		rejectUnauthorized = false,
		timeout = 30_000,
	} = fletcherOptions || {};

	const options: OptionsInit = {
		body,
		encoding,
		followRedirect: maxRedirections > 0,
		headers,
		https: { rejectUnauthorized },
		maxRedirects: maxRedirections,
		method: method as Method,
		retry: { limit: 0 },
		timeout: { request: timeout },
		url,
	};

	if (proxy) {
		const { host, password, port, protocol = "http", username } = proxy;
		const auth = `${username}:${password}`;
		options.proxyUrl = `${protocol}://${auth}@${host}:${port}`;
	}

	return options;
}

export async function request(
	url: string,
	userOptions?: Partial<IFletcherOptions>
) {
	try {
		const options = toGotOptions(url, userOptions);
		const response_ = await got(options);
		const response = response_ as Response;

		if (userOptions?.onAfterRequest) {
			const r = userOptions.onAfterRequest({ response });
			await Promise.resolve(r);
		}

		const { headers, statusCode } = response;

		const statusMessage = response.statusMessage || STATUS_CODES[statusCode];

		if (userOptions?.validateStatus) {
			response.ok = userOptions.validateStatus(statusCode);
		}

		return {
			headers,
			statusCode,
			statusMessage: response.ok ? statusMessage : `${statusMessage} - ${url}`,
			text: async () => response.body as string,
		} as IResponse;
	} catch (error_) {
		const error = error_ as Error;
		// @ts-expect-error caus is not a standard property
		const { cause, code, options } = error_ as RequestError;
		const { headers } = options || {};

		const statusCode = code || 500;
		const statusMessage =
			cause?.message || error?.message || STATUS_CODES[statusCode];

		return {
			headers,
			statusCode,
			statusMessage: `${statusMessage} - ${url}`,
			text: async () => JSON.stringify({ cause, statusCode, statusMessage }),
		} as IResponse;
	}
}
