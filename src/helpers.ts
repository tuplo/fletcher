import crypto from 'crypto';
import { StringDecoder } from 'string_decoder';
import type { Response } from 'node-fetch';

import type { FletcherUserOptions } from './fletcher.d';

export function delay<T>(
  ms = 0,
  fn: (...args: unknown[]) => Promise<T>
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn());
    }, ms);
  });
}

function md5(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeObject(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => [
      key.toLowerCase(),
      encodeURI(`${value}`).toLowerCase(),
    ])
    .map(([key, value]) => `${key}=${value}`)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
}

export function hashRequest(
  format: string,
  url: string,
  options?: Partial<FletcherUserOptions>
): string {
  const { headers = {}, urlSearchParams = {} } = options || {};

  return md5(
    `${format}${url}${JSON.stringify({
      headers: serializeObject(headers),
      urlSearchParams: serializeObject(urlSearchParams),
    })}`
  );
}

export async function decodeEncoding(
  res: Promise<Response>,
  encoding?: BufferEncoding
): Promise<string> {
  if (!encoding) {
    return res.then((r) => r.text());
  }
  const decoder = new StringDecoder(encoding);
  return res.then((r) => r.buffer()).then((buf) => decoder.write(buf));
}
