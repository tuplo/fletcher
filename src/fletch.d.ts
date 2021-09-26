/// <reference types="cheerio" />
import type { Options as RetryOptions } from 'async-retry';
import type { RequestInit, HeadersInit } from 'node-fetch';
import type * as VM from 'vm';

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

export type FletchUserOptions = {
  cache: boolean;
  delay: number;
  encoding: BufferEncoding;
  formData: RequestData;
  jsonData: RequestData;
  headers: HeadersInit;
  log: boolean;
  method: 'GET' | 'POST' | 'HEAD';
  proxy: ProxyConfig;
  retry: boolean | number | RetryOptions;
  scriptFindFn: (script: cheerio.Element) => boolean;
  scriptPath: string;
  scriptSandbox: VM.Context;
  urlSearchParams: UrlSearchParams;
  validateStatus: (statusCode: number) => boolean;
};

export type FletchOptions = {
  url: string;
  cache: boolean;
  delay: number;
  retry: RetryOptions;
  validateStatus: (statusCode: number) => boolean;
} & RequestInit;

export interface Instance {
  text: (url: string, options?: Partial<FletchUserOptions>) => Promise<string>;
  html: (
    url: string,
    options?: Partial<FletchUserOptions>
  ) => Promise<cheerio.Cheerio>;
  script: <T = unknown>(
    url: string,
    options?: Partial<FletchUserOptions>
  ) => Promise<T>;
  json: <T = unknown>(
    url: string,
    options?: Partial<FletchUserOptions>
  ) => Promise<T>;
  jsonld: (
    url: string,
    options?: Partial<FletchUserOptions>
  ) => Promise<unknown[]>;
}
