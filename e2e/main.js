import { strict as assert } from 'assert';
import fletch from '@tuplo/fletch';

(async function main() {
  const $ = await fletch.html('https://httpbin.org/html');
  const result = $.find('h1').text();
  assert.equal(result, 'Herman Melville - Moby-Dick');
})();
