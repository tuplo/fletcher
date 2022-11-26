/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
import fletcher from "./index";

const fletchSpy = jest.fn();
jest.mock("./services/fletch", () => ({
	__esModule: true,
	fletch: (url: string) => fletchSpy(url),
}));

describe("cache", () => {
	afterEach(() => {
		fletchSpy.mockClear();
	});

	afterAll(() => {
		fletchSpy.mockRestore();
	});

	it("caches requests with the same url (text)", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => "foobar",
		});

		const result = [];
		for await (const i of new Array(3).fill(null)) {
			const r = await fletcher.text("https://fletcher.dev", { cache: true });
			result.push(r);
		}

		const expected = ["foobar", "foobar", "foobar"];
		expect(fletchSpy).toHaveBeenCalledTimes(1);
		expect(result).toStrictEqual(expected);
	});

	it("caches requests with the same url (html)", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => "<h1>foobar</h1>",
		});

		const result = [];
		for await (const i of new Array(3).fill(null)) {
			const r = await fletcher.html("https://fletcher.dev", { cache: true });
			result.push(r);
		}

		const expected = ["foobar", "foobar", "foobar"];
		expect(fletchSpy).toHaveBeenCalledTimes(1);
		expect(result.map((r) => r.find("h1").text())).toStrictEqual(expected);
	});

	it("caches requests with the same url (json)", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ foo: "bar" }),
		});

		const result = [];
		for await (const i of new Array(3).fill(null)) {
			const r = await fletcher.json("https://fletcher.dev", { cache: true });
			result.push(r);
		}

		const expected = [{ foo: "bar" }, { foo: "bar" }, { foo: "bar" }];
		expect(fletchSpy).toHaveBeenCalledTimes(1);
		expect(result).toStrictEqual(expected);
	});

	it("doesn't cache requests with different options", async () => {
		fletchSpy.mockResolvedValue({
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
		expect(fletchSpy).toHaveBeenCalledTimes(3);
		expect(result).toStrictEqual(expected);
	});
});
