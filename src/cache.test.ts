/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import fletcher from "./index";

const fetchSpy = jest.fn();
jest.mock("./services/fetch", () => ({
	__esModule: true,
	fetch: (url: string) => fetchSpy(url),
}));

describe("cache", () => {
	afterEach(() => {
		fetchSpy.mockClear();
	});

	afterAll(() => {
		fetchSpy.mockRestore();
	});

	it("caches requests with the same url (text)", async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => "foobar",
		});

		const result = [];
		for await (const i of new Array(3).fill(null)) {
			const r = await fletcher.text("https://fletcher.dev", { cache: true });
			result.push(r);
		}

		const expected = ["foobar", "foobar", "foobar"];
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(result).toStrictEqual(expected);
	});

	it("caches requests with the same url (html)", async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => "<h1>foobar</h1>",
		});

		const result = [];
		for await (const i of new Array(3).fill(null)) {
			const r = await fletcher.html("https://fletcher.dev", { cache: true });
			result.push(r);
		}

		const expected = ["foobar", "foobar", "foobar"];
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(result.map((r) => r.find("h1").text())).toStrictEqual(expected);
	});

	it("caches requests with the same url (json)", async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ foo: "bar" }),
		});

		const result = [];
		for await (const i of new Array(3).fill(null)) {
			const r = await fletcher.json("https://fletcher.dev", { cache: true });
			result.push(r);
		}

		const expected = [{ foo: "bar" }, { foo: "bar" }, { foo: "bar" }];
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		expect(result).toStrictEqual(expected);
	});

	it("doesn't cache requests with different options", async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ foo: "bar" }),
		});

		const result = [];
		for await (const i of new Array(3).fill(null).map((_, j) => j)) {
			const r = await fletcher.json("https://fletcher.dev", {
				formData: { i },
				cache: true,
			});
			result.push(r);
		}

		const expected = [{ foo: "bar" }, { foo: "bar" }, { foo: "bar" }];
		expect(fetchSpy).toHaveBeenCalledTimes(3);
		expect(result).toStrictEqual(expected);
	});
});
