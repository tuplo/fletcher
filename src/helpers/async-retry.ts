import retrier, { type WrapOptions } from "retry";

export type IOptions = WrapOptions & {
	onRetry?: ((e: Error, attempt: number) => unknown) | undefined;
};

type IErrorWithBail = Error & {
	bail?: (error: Error) => void;
};

type IAsyncFn<T> = {
	(...args: unknown[]): Promise<T>;
};

export function retry<T>(fn: IAsyncFn<T>, opts: IOptions): Promise<T> {
	function run(
		resolve: (value: unknown) => void,
		reject: (reason?: unknown) => void
	) {
		const options = opts || {};

		// Default `randomize` to true
		if (!("randomize" in options)) {
			options.randomize = true;
		}

		const op = retrier.operation(options);

		function bail(err: unknown) {
			reject(err || new Error("Aborted"));
		}

		function onError(err: IErrorWithBail, num: number) {
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
