import { vi } from "vitest";

import { toFletcherOptions } from "./options";
import fletcher from "./index";

const requestSpy = vi.fn();
vi.mock("./services/request", () => ({
	__esModule: true,
	request: (url: string) => requestSpy(url),
}));

describe("retry", () => {
	afterEach(() => {
		requestSpy.mockClear();
	});

	afterAll(() => {
		requestSpy.mockRestore();
	});

	it("retries failed request", async () => {
		let i = 0;
		requestSpy.mockImplementation(() => {
			i += 1;
			return {
				statusCode: i < 3 ? 500 : 200,
				text: () => "<html></html>",
			};
		});

		await fletcher.html("http://localhost", {
			retry: {
				retries: 3,
				factor: 1,
				minTimeout: 1,
				maxTimeout: 1,
				randomize: false,
			},
		});

		expect(requestSpy).toHaveBeenCalledTimes(3);
	});

	it("doesn't retry if options.retry=false", async () => {
		requestSpy.mockResolvedValue({ statusCode: 500 });
		const result = fletcher.html("http://localhost", {
			retry: false,
		});

		await expect(result).rejects.toThrow("500: undefined");
		expect(requestSpy).toHaveBeenCalledTimes(1);
	});

	it("retries number of times if retry:number", async () => {
		const mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.1);
		requestSpy.mockResolvedValue({ statusCode: 500, statusMessage: "foobar" });
		const r = fletcher.html("http://localhost", {
			retry: 1,
		});

		await expect(r).rejects.toThrow("foobar");
		expect(requestSpy).toHaveBeenCalledTimes(2);

		mathRandomSpy.mockRestore();
	});

	describe("retry options", () => {
		it("default options", () => {
			const result = toFletcherOptions("https://foo.com");
			const expected = {
				factor: 2,
				maxTimeout: Infinity,
				minTimeout: 1000,
				randomize: true,
				retries: 10,
			};
			expect(result.retry).toStrictEqual(expected);
		});

		it("changes number of retries", () => {
			const result = toFletcherOptions("https://foo.com", { retry: 3 });
			const expected = {
				factor: 2,
				maxTimeout: Infinity,
				minTimeout: 1000,
				randomize: true,
				retries: 3,
			};
			expect(result.retry).toStrictEqual(expected);
		});

		it("disables retry", () => {
			const result = toFletcherOptions("https://foo.com", { retry: false });
			const expected = { retries: 0 };
			expect(result.retry).toStrictEqual(expected);
		});
	});
});
