/// <reference types="cheerio" />
import type { Options as RetryOptions } from 'async-retry';
import type { RequestInit, HeadersInit, RequestRedirect } from 'node-fetch';
import type * as VM from 'vm';
import type { ScreenshotOptions } from 'puppeteer-core';

export type UrlSearchParams = Record<string, string | number | undefined>;

export type ProxyConfig = {
  username?: string;
  password?: string;
  host: string;
  port: number;
  rejectUnauthorized?: boolean;
};

type RequestData = Record<
  string,
  string | string[] | number | boolean | undefined | null
>;

export type Headers = Partial<{
  [key: string]: string;
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
  follow: number;
  formData: RequestData;
  formUrlEncoded: Record<string, string | number | boolean>;
  jsonData: RequestData;
  headers: HeadersInit;
  log: boolean;
  method: 'GET' | 'POST' | 'HEAD';
  proxy: ProxyConfig;
  redirect: RequestRedirect;
  retry: boolean | number | RetryOptions;
  scriptFindFn: (script: cheerio.Element) => boolean;
  scriptPath: string;
  scriptSandbox: VM.Context;
  urlSearchParams: UrlSearchParams;
  userAgent: string;
  validateStatus: (statusCode: number) => boolean;
};

export type FletcherOptions = {
  url: string;
  cache: boolean;
  delay: number;
  retry: RetryOptions;
  validateStatus: (statusCode: number) => boolean;
} & RequestInit;

export interface Instance {
  headers: (
    url: string,
    options?: Partial<FletcherUserOptions>
  ) => Promise<Headers>;
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
