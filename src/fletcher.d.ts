import { type IncomingHttpHeaders } from "node:http";
import type * as VM from "node:vm";

import {
	type AxiosRequestConfig,
	type AxiosResponse,
	type AxiosResponseHeaders,
	type Method,
} from "axios";
import { type AnyNode, type Cheerio, type Element } from "cheerio";
import { type Page, type ScreenshotOptions } from "puppeteer-core";

import { type IOptions as IRetryOptions } from "./helpers/async-retry";
import { type CookieJar } from "./helpers/cookie-jar";

export type UrlSearchParams = Record<string, number | string | undefined>;

export type FetchOptions = AxiosRequestConfig;

export { type CookieJar, type ICookie } from "./helpers/cookie-jar";

export type IProxyConfig = {
	host: string;
	password?: string;
	port: number;
	protocol?: string;
	username?: string;
};

type RequestRedirect = "error" | "follow" | "manual";

type RequestData = Record<string, unknown>;

type IOnAfterRequestArgs = {
	response: AxiosResponse;
};

export type IOnAfterRequestFn = {
	(args: IOnAfterRequestArgs): Promise<void> | void;
};

export type IFletcherBrowserUserOptions = {
	blockedResourceTypes: boolean | string[];
	endpoint: string;
	onPageReady: (page: Page) => Promise<unknown>;
	screenshot: ScreenshotOptions;
	waitForSelector: string;
};

export type ICacheParams = {
	format: string;
	options?: Partial<IFletcherUserOptions>;
	payload?: string;
	url: string;
};

export type IFletcherCacheMethods = {
	hit: (key: string) => null | unknown;
	key: (params: ICacheParams) => string;
	write: (key: string, payload?: string) => void;
};

export type IFletcherUserOptions = {
	browser: Partial<IFletcherBrowserUserOptions>;
	cache: boolean;
	cacheMethods: Partial<IFletcherCacheMethods>;
	delay: number;
	embeddedJsonSelector: string;
	encoding: BufferEncoding;
	formData: RequestData;
	formUrlEncoded: Record<string, boolean | number | string>;
	headers: Record<string, string>;
	jsonData: RequestData;
	log: boolean;
	maxRedirections: number;
	method: Method;
	onAfterRequest?: IOnAfterRequestFn;
	proxy: IProxyConfig;
	rejectUnauthorized?: boolean;
	retry: boolean | IRetryOptions | number;
	scriptFindFn: (script: Element) => boolean;
	scriptPath: string;
	scriptSandbox: VM.Context;
	timeout: number;
	urlSearchParams: UrlSearchParams;
	userAgent: string;
	validateStatus: (statusCode: number) => boolean;
};

export type IFletcherOptions = {
	body?: string;
	cache: boolean;
	delay: number;
	encoding: BufferEncoding;
	headers: Record<string, string>;
	maxRedirections?: number | undefined; // =20 maximum redirect count. 0 to not follow redirect
	method: Method;
	onAfterRequest?: IOnAfterRequestFn;
	proxy?: IProxyConfig;
	rejectUnauthorized?: boolean;
	retry: IRetryOptions;
	timeout: number;
	url: string;
	validateStatus: (statusCode: number) => boolean;
};

type IInstanceMethod<T> = {
	(url: string, options?: Partial<IFletcherUserOptions>): Promise<T>;
};

export type IInstance = {
	browser: {
		close: () => Promise<void>;
		html: IInstanceMethod<Cheerio<AnyNode>>;
		json: <T = unknown>(
			url: string,
			requestUrl: RegExp | string,
			options?: Partial<IFletcherUserOptions>
		) => Promise<T>;
		jsonld: IInstanceMethod<unknown[]>;
		script: <T = unknown>(
			url: string,
			options?: Partial<IFletcherUserOptions>
		) => Promise<T>;
	};
	cookies: IInstanceMethod<CookieJar>;
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
};

export type IResponse = {
	// body: Readable & Dispatcher.BodyMixin;
	headers: AxiosResponseHeaders;
	statusCode: number;
	statusMessage?: string;
	text: () => Promise<string>;
};
