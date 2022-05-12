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
