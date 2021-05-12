import type { RequestInit } from 'node-fetch';
import type * as VM from 'vm';

export type UrlSearchParams = Record<string, string | number | undefined>;

export type FletchUserOptions = Partial<{
  scriptFindFn: (
    $page: cheerio.Cheerio
  ) => cheerio.Cheerio | cheerio.Element | undefined;
  scriptPath: string;
  scriptSandbox: VM.Context;
  urlSearchParams: UrlSearchParams;
  validateStatus?: (statusCode: number) => boolean;
}>;

export type FletchOptions = { url: string } & RequestInit;
