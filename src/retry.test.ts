import { toFletcherOptions } from "./options";
import fletcher from "./index";

const fletchSpy = jest.fn();
jest.mock("./services/fletch", () => ({
	__esModule: true,
	fletch: (url: string) => fletchSpy(url),
}));

describe("retry", () => {
	afterEach(() => {
		fletchSpy.mockClear();
	});

	afterAll(() => {
		fletchSpy.mockRestore();
	});

	it("retries failed request", async () => {
		let i = 0;
		fletchSpy.mockImplementation(() => {
			i += 1;
			return {
				status: i < 3 ? 500 : 200,
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

		expect(fletchSpy).toHaveBeenCalledTimes(3);
	});

	it("doesn't retry if options.retry=false", async () => {
		fletchSpy.mockResolvedValue({ status: 500 });
		const result = fletcher.html("http://localhost", {
			retry: false,
		});

		await expect(result).rejects.toThrow("500: undefined");
		expect(fletchSpy).toHaveBeenCalledTimes(1);
	});

	it("retries number of times if retry:number", async () => {
		const mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.1);
		fletchSpy.mockResolvedValue({ status: 500, statusText: "foobar" });
		const r = fletcher.html("http://localhost", {
			retry: 1,
		});

		await expect(r).rejects.toThrow("foobar");
		expect(fletchSpy).toHaveBeenCalledTimes(2);

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
