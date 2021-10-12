/* eslint-disable import/prefer-default-export */
import { strict as assert } from 'assert';
import fletcher from '@tuplo/fletcher';

export async function getPageHeading() {
  const $ = await fletcher.html('https://httpbin.org/html');
  return $.find('h1').text();
}

(async function main() {
  const result = await getPageHeading();
  assert.equal(result, 'Herman Melville - Moby-Dick');
})();
