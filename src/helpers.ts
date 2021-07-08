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
