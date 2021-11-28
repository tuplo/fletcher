import { StringDecoder } from 'string_decoder';
import type { Response } from 'node-fetch';

export function delay<T>(
  ms: number,
  fn: (...args: unknown[]) => Promise<T>
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fn());
    }, ms);
  });
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
