import fletch from '@tuplo/fletch';

it('is testable with Jest and JavaScript', async () => {
  const $ = await fletch.html('https://httpbin.org/html');
  const result = $.find('h1').text();

  const expected = 'Herman Melville - Moby-Dick';
  expect(result).toBe(expected);
});
