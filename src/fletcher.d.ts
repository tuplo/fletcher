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

export type UrlSearchParams = Record<string, string | number | undefined>;

export type FetchOptions = AxiosRequestConfig;

export { type ICookie, type CookieJar } from "./helpers/cookie-jar";

export type IProxyConfig = {
	username?: string;
	password?: string;
	host: string;
	port: number;
	protocol?: string;
};

type RequestRedirect = "follow" | "error" | "manual";

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
	url: string;
	options?: Partial<IFletcherUserOptions>;
	payload?: string;
};

export type IFletcherCacheMethods = {
	hit: (key: string) => null | unknown;
	write: (key: string, payload?: string) => void;
	key: (params: ICacheParams) => string;
};

export type IFletcherUserOptions = {
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
	onAfterRequest?: IOnAfterRequestFn;
	proxy: IProxyConfig;
	rejectUnauthorized?: boolean;
	retry: boolean | number | IRetryOptions;
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
	maxRedirections?: number | undefined; // =20 maximum redirect count. 0 to not follow redirect
	headers: Record<string, string>;
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
	embeddedJson: <T = unknown>(
		url: string,
		options?: Partial<IFletcherUserOptions>
	) => Promise<T>;
	headers: IInstanceMethod<IncomingHttpHeaders>;
	cookies: IInstanceMethod<CookieJar>;
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
};

export type IResponse = {
	// body: Readable & Dispatcher.BodyMixin;
	headers: AxiosResponseHeaders;
	statusCode: number;
	statusMessage?: string;
	text: () => Promise<string>;
};
