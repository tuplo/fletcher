import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import { STATUS_CODES } from "http";
import https from "https";
import { URL } from "url";
import { HttpsProxyAgent } from "hpagent";

import type * as FLETCH from "../fletcher";

function toFetchOptions(
	fletcherOptions: FLETCH.FletcherOptions
): FLETCH.FetchOptions {
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
	} = fletcherOptions;

	const options: FLETCH.FetchOptions = {
		data: body,
		responseEncoding: encoding,
		headers,
		maxRedirects: maxRedirections,
		method,
		responseType: "text",
		timeout,
	};

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

export async function fetch(
	url: string,
	fletcherOptions: FLETCH.FletcherOptions
): Promise<FLETCH.Response> {
	const options = toFetchOptions(fletcherOptions);

	try {
		// encode special characters on the URL
		const u = new URL(url);
		const { data, headers, status, statusText } = await axios(u.href, options);

		return {
			headers,
			status,
			statusText,
			text: async () => data,
		};
	} catch (e) {
		const error = e as AxiosError;
		const { response = {} as AxiosResponse } = error;
		const { status, headers } = response;
		const statusText =
			error.message || response.statusText || STATUS_CODES[status];

		return {
			headers,
			status,
			statusText: `${statusText} - ${url}`,
			text: async () => JSON.stringify({ status, statusText }),
		};
	}
}
