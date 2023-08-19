import type { IncomingHttpHeaders } from "node:http";
import type * as VM from "node:vm";

import type { AxiosRequestConfig, AxiosResponseHeaders, Method } from "axios";
import type { AnyNode, Cheerio, Element } from "cheerio";
import type { ScreenshotOptions } from "puppeteer-core";

import type { IOptions as RetryOptions } from "./helpers/async-retry";

export type UrlSearchParams = Record<string, string | number | undefined>;

export type FetchOptions = AxiosRequestConfig;

export interface IProxyConfig {
	username?: string;
	password?: string;
	host: string;
	port: number;
	protocol?: string;
}

type RequestRedirect = "follow" | "error" | "manual";

type RequestData = Record<string, unknown>;

export interface IFletcherBrowserUserOptions {
	blockedResourceTypes: boolean | string[];
	endpoint: string;
	screenshot: ScreenshotOptions;
	waitForSelector: string;
}

export interface ICacheParams {
	format: string;
	url: string;
	options?: Partial<IFletcherUserOptions>;
	payload?: string;
}

export interface IFletcherCacheMethods {
	hit: (key: string) => null | unknown;
	write: (key: string, payload?: string) => void;
	key: (params: ICacheParams) => string;
}

export interface IFletcherUserOptions {
	browser: Partial<IFletcherBrowserUserOptions>;
	cache: boolean;
	cacheMethods: Partial<IFletcherCacheMethods>;
	delay: number;
	embeddedJsonSelector: string;
	encoding: BufferEncoding;
	formData: RequestData;
	formUrlEncoded: Record<string, string | number | boolean>;
	jsonData: RequestData;
	headers: Record<string, string>;
	log: boolean;
	maxRedirections: number;
	method: Method;
	proxy: IProxyConfig;
	rejectUnauthorized?: boolean;
	retry: boolean | number | RetryOptions;
	scriptFindFn: (script: Element) => boolean;
	scriptPath: string;
	scriptSandbox: VM.Context;
	timeout: number;
	urlSearchParams: UrlSearchParams;
	userAgent: string;
	validateStatus: (statusCode: number) => boolean;
}

export interface IFletcherOptions {
	body?: string;
	cache: boolean;
	delay: number;
	encoding: BufferEncoding;
	maxRedirections?: number | undefined; // =20 maximum redirect count. 0 to not follow redirect
	headers: Record<string, string>;
	method: Method;
	proxy?: IProxyConfig;
	rejectUnauthorized?: boolean;
	retry: RetryOptions;
	timeout: number;
	url: string;
	validateStatus: (statusCode: number) => boolean;
}

interface IInstanceMethod<T> {
	(url: string, options?: Partial<IFletcherUserOptions>): Promise<T>;
}

export interface IInstance {
	embeddedJson: <T = unknown>(
		url: string,
		options?: Partial<IFletcherUserOptions>
	) => Promise<T>;
	headers: IInstanceMethod<IncomingHttpHeaders>;
	html: IInstanceMethod<Cheerio<AnyNode>>;
	json: <T = unknown>(
		url: string,
		options?: Partial<IFletcherUserOptions>
	) => Promise<T>;
	jsonld: IInstanceMethod<unknown[]>;
	response: IInstanceMethod<IResponse>;
	script: <T = unknown>(
		url: string,
		options?: Partial<IFletcherUserOptions>
	) => Promise<T>;
	text: IInstanceMethod<string>;
	browser: {
		close: () => Promise<void>;
		json: <T = unknown>(
			url: string,
			requestUrl: string | RegExp,
			options?: Partial<IFletcherUserOptions>
		) => Promise<T>;
		html: IInstanceMethod<Cheerio<AnyNode>>;

		script: <T = unknown>(
			url: string,
			options?: Partial<IFletcherUserOptions>
		) => Promise<T>;
		jsonld: IInstanceMethod<unknown[]>;
	};
}

export interface IResponse {
	// body: Readable & Dispatcher.BodyMixin;
	headers: AxiosResponseHeaders;
	statusCode: number;
	statusMessage?: string;
	text: () => Promise<string>;
}
