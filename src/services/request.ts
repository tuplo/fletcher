import { STATUS_CODES } from "node:http";
import https from "node:https";

import axios, {
	type AxiosError,
	type AxiosRequestConfig,
	type AxiosResponse,
	type AxiosResponseHeaders,
} from "axios";
import { HttpsProxyAgent } from "hpagent";

import { type IFletcherOptions, type IResponse } from "../fletcher";

function toAxiosOptions(fletcherOptions?: Partial<IFletcherOptions>) {
	const {
		body,
		encoding,
		headers,
		maxRedirections = 999, // follow all redirects by default
		method = "GET",
		proxy,
		rejectUnauthorized,
		timeout = 30_000,
		validateStatus,
	} = fletcherOptions || {};

	const options: AxiosRequestConfig = {
		maxRedirects: maxRedirections,
		method,
		responseType: "text",
		timeout,
	};

	if (body) {
		options.data = body;
	}

	if (encoding) {
		options.responseEncoding = encoding;
	}

	if (headers) {
		options.headers = headers;
	}

	if (validateStatus) {
		options.validateStatus = validateStatus;
	}

	if (options.maxRedirects === 0) {
		options.validateStatus =
			validateStatus || ((statusCode) => statusCode >= 200 && statusCode < 400);
	}

	if (rejectUnauthorized !== undefined && !proxy) {
		options.httpsAgent = new https.Agent({
			rejectUnauthorized: rejectUnauthorized ?? false,
		});
	}

	if (proxy) {
		const { host, password, port, protocol = "http", username } = proxy;
		const auth = `${username}:${password}`;
		options.httpsAgent = new HttpsProxyAgent({
			proxy: `${protocol}://${auth}@${host}:${port}`,
			rejectUnauthorized: rejectUnauthorized ?? false,
		});
	}

	return options;
}

export async function request(
	url: string,
	userOptions?: Partial<IFletcherOptions>
) {
	try {
		// encode special characters on the URL
		const uri = new URL(url);
		const options = toAxiosOptions(userOptions);
		const response = await axios(uri.href, options);
		const {
			data,
			headers,
			status: statusCode,
			statusText: statusMessage,
		} = response;

		if (userOptions?.onAfterRequest) {
			const r = userOptions.onAfterRequest({ response });
			await Promise.resolve(r);
		}

		return {
			headers: headers as AxiosResponseHeaders,
			statusCode,
			statusMessage,
			text: async () => data,
		};
	} catch (error_) {
		const error = error_ as AxiosError;
		const { cause, response = {} as AxiosResponse } = error;
		const { headers, status: statusCode } = response;

		const statusMessage =
			response.statusText || error.message || STATUS_CODES[statusCode];

		return {
			headers,
			statusCode: statusCode || error.code,
			statusMessage: `${statusMessage} - ${url}`,
			text: async () => JSON.stringify({ cause, statusCode, statusMessage }),
		} as IResponse;
	}
}
