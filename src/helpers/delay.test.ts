import { vi } from "vitest";

import { delay } from "./delay";

describe("delay", () => {
	it("delays execution of given function", () => {
		vi.useFakeTimers();
		const fnSpy = vi.fn();

		delay(30_000, fnSpy);
		expect(fnSpy).not.toHaveBeenCalled();
		vi.advanceTimersByTime(30_000);
		expect(fnSpy).toHaveBeenCalledTimes(1);

		vi.useRealTimers();
	});
});
