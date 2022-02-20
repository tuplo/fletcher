/// <reference types="cheerio" />
import type { Options as RetryOptions } from 'async-retry';
import type * as VM from 'vm';
import type { ScreenshotOptions } from 'puppeteer-core';
import type { IncomingHttpHeaders } from 'http';
import type { Method, AxiosRequestConfig } from 'axios';

export type UrlSearchParams = Record<string, string | number | undefined>;

export type FetchOptions = AxiosRequestConfig;

export type ProxyConfig = {
  username?: string;
  password?: string;
  host: string;
  port: number;
  protocol?: string;
};

type RequestRedirect = 'follow' | 'error' | 'manual';

type RequestData = Record<
  string,
  string | string[] | number | boolean | undefined | null
>;

export type Headers = Partial<{
  [key: string]: string | string[];
}>;

export type FletcherBrowserUserOptions = {
  blockedResourceTypes: boolean | string[];
  endpoint: string;
  screenshot: ScreenshotOptions;
  waitForSelector: string;
};

export type FletcherUserOptions = {
  browser: Partial<FletcherBrowserUserOptions>;
  cache: boolean;
  delay: number;
  encoding: BufferEncoding;
  formData: RequestData;
  formUrlEncoded: Record<string, string | number | boolean>;
  jsonData: RequestData;
  headers: Record<string, string>;
  log: boolean;
  maxRedirections: number;
  method: Method;
  proxy: ProxyConfig;
  rejectUnauthorized?: boolean;
  retry: boolean | number | RetryOptions;
  scriptFindFn: (script: cheerio.Element) => boolean;
  scriptPath: string;
  scriptSandbox: VM.Context;
  urlSearchParams: UrlSearchParams;
  userAgent: string;
  validateStatus: (statusCode: number) => boolean;
};

export type FletcherOptions = {
  body?: string;
  cache: boolean;
  delay: number;
  encoding: BufferEncoding;
  maxRedirections?: number | undefined; // =20 maximum redirect count. 0 to not follow redirect
  headers: Record<string, string>;
  method: Method;
  proxy?: ProxyConfig;
  rejectUnauthorized?: boolean;
  retry: RetryOptions;
  url: string;
  validateStatus: (statusCode: number) => boolean;
};

export interface Instance {
  headers: (
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<IncomingHttpHeaders>;
  html: (
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<cheerio.Cheerio>;
  json: <T = unknown>(
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<T>;
  jsonld: (
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<unknown[]>;
  response: (
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<Response>;
  script: <T = unknown>(
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<T>;
  text: (
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<string>;
  browser: {
    close: () => Promise<void>;
    json: <T = unknown>(
      url: string,
      requestUrl: string | RegExp,
      options?: Partial<FletcherUserOptions>
    ) => Promise<T>;
    html: (
      url: string,
      options?: Partial<FletcherUserOptions>
    ) => Promise<cheerio.Cheerio>;
    script: <T = unknown>(
      url: string,
      options?: Partial<FletcherUserOptions>
    ) => Promise<T>;
    jsonld: (
      url: string,
      options?: Partial<FletcherUserOptions>
    ) => Promise<unknown[]>;
  };
}

export type Response = {
  // body: Readable & Dispatcher.BodyMixin;
  headers: IncomingHttpHeaders;
  status: number;
  statusText?: string;
  text: () => Promise<string>;
};
