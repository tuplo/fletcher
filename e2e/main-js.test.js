import { getPageHeading } from './main-js';

it('is testable with Jest and JavaScript', async () => {
  const result = await getPageHeading();

  const expected = 'Herman Melville - Moby-Dick';
  expect(result).toBe(expected);
});
