import { getPageHeading } from './main-ts';

describe('fletch', () => {
  it('is testable with Jest and TypeScript', async () => {
    expect.assertions(1);
    const result = await getPageHeading();

    const expected = 'Herman Melville - Moby-Dick';
    expect(result).toBe(expected);
  });
});
