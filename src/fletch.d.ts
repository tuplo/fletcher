/// <reference types="cheerio" />
import type { Options as RetryOptions } from 'async-retry';
import type { RequestInit, HeadersInit } from 'node-fetch';
import type * as VM from 'vm';

export type UrlSearchParams = Record<string, string | number | undefined>;

export type ProxyOptions = {
  username: string;
  password: string;
  host: string;
  port: number;
};

export type FletchUserOptions = {
  delay: number;
  headers: HeadersInit;
  proxy: ProxyOptions;
  retry: boolean | number | RetryOptions;
  scriptFindFn: (script: cheerio.Element) => boolean;
  scriptPath: string;
  scriptSandbox: VM.Context;
  urlSearchParams: UrlSearchParams;
  validateStatus: (statusCode: number) => boolean;
};

export type FletchOptions = {
  url: string;
  delay: number;
  retry: RetryOptions;
} & RequestInit;

export interface Instance {
  text: (url: string, options: Partial<FletchUserOptions>) => Promise<string>;
  html: (
    url: string,
    options: Partial<FletchUserOptions>
  ) => Promise<cheerio.Cheerio>;
  script: <T = unknown>(
    url: string,
    options: Partial<FletchUserOptions>
  ) => Promise<T>;
  json: <T = unknown>(
    url: string,
    options: Partial<FletchUserOptions>
  ) => Promise<T>;
}
