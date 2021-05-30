/* eslint-disable import/prefer-default-export */
import { strict as assert } from 'assert';
import fletch from '@tuplo/fletch';

export async function getPageHeading(): Promise<string> {
  const $ = await fletch.html('https://httpbin.org/html');
  return $.find('h1').text();
}

(async function main() {
  const result = await getPageHeading();
  assert.equal(result, 'Herman Melville - Moby-Dick');
})();
