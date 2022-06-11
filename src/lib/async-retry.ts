import type { WrapOptions } from 'retry';
import retrier from 'retry';

export interface Options extends WrapOptions {
  onRetry?: ((e: Error, attempt: number) => unknown) | undefined;
}

interface ErrorWithBail extends Error {
  bail?: (error: Error) => void;
}

type AsyncFn<T> = (...args: unknown[]) => Promise<T>;

export function retry<T>(fn: AsyncFn<T>, opts: Options): Promise<T> {
  function run(
    resolve: (value: unknown) => void,
    reject: (reason?: unknown) => void
  ) {
    const options = opts || {};

    // Default `randomize` to true
    if (!('randomize' in options)) {
      options.randomize = true;
    }

    const op = retrier.operation(options);

    function bail(err: unknown) {
      reject(err || new Error('Aborted'));
    }

    function onError(err: ErrorWithBail, num: number) {
      if (err.bail) {
        bail(err);
        return;
      }

      if (!op.retry(err)) {
        reject(op.mainError());
      } else if (options.onRetry) {
        options.onRetry(err, num);
      }
    }

    function runAttempt(num: number) {
      let val;

      try {
        val = fn(bail, num);
      } catch (err) {
        onError(err as Error, num);
        return;
      }

      Promise.resolve(val)
        .then(resolve)
        .catch((err) => {
          onError(err, num);
        });
    }

    op.attempt(runAttempt);
  }

  return new Promise(run) as Promise<T>;
}
