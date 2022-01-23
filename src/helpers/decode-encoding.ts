/* eslint-disable no-restricted-syntax */
import type { Response } from '../fletcher.d';

export default async function decodeEncoding(
  res: Promise<Response>,
  encoding?: BufferEncoding
): Promise<string> {
  if (!encoding) {
    return res.then((r) => r.text());
  }

  return res.then(async (r) => {
    r.body.setEncoding(encoding);
    const bodyParts = [];
    for await (const data of r.body) {
      bodyParts.push(data);
    }
    return bodyParts.join('');
  });
}
