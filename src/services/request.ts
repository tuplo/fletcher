import { STATUS_CODES } from "node:http";
import https from "node:https";

import type {
	AxiosError,
	AxiosRequestConfig,
	AxiosResponse,
	AxiosResponseHeaders,
} from "axios";
import axios from "axios";
import { HttpsProxyAgent } from "hpagent";

import type { IFletcherOptions, IResponse } from "../fletcher.d";

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

	if (typeof rejectUnauthorized !== "undefined" && !proxy) {
		options.httpsAgent = new https.Agent({
			rejectUnauthorized: rejectUnauthorized ?? false,
		});
	}

	if (proxy) {
		const { username, password, host, port, protocol = "http" } = proxy;
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
		const u = new URL(url);
		const options = toAxiosOptions(userOptions);
		const response = await axios(u.href, options);
		const {
			data,
			headers,
			status: statusCode,
			statusText: statusMessage,
		} = response;

		return {
			headers: headers as AxiosResponseHeaders,
			statusCode,
			statusMessage,
			text: async () => data,
		};
	} catch (e) {
		const error = e as AxiosError;
		const { response = {} as AxiosResponse } = error;
		const { status: statusCode, headers } = response;
		const statusMessage =
			response.statusText || error.message || STATUS_CODES[statusCode];

		return {
			headers,
			statusCode,
			statusMessage: `${statusMessage} - ${url}`,
			text: async () => JSON.stringify({ statusCode, statusMessage }),
		} as IResponse;
	}
}
