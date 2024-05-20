import retrier, { type WrapOptions } from "retry";

export type IOptions = {
	onRetry?: ((e: Error, attempt: number) => unknown) | undefined;
} & WrapOptions;

type IErrorWithBail = {
	bail?: (error: Error) => void;
} & Error;

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
			} catch (error) {
				onError(error as Error, num);
				return;
			}

			Promise.resolve(val)
				.then(resolve)
				.catch((error) => {
					onError(error, num);
				});
		}

		op.attempt(runAttempt);
	}

	return new Promise(run) as Promise<T>;
}
