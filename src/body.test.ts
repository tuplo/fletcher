import { getRandomPort, server } from "src/mocks";

import fletcher from "./index";

describe("body formats", () => {
	let uri: URL;
	let port: number;

	beforeAll(async () => {
		port = await getRandomPort();
		server.listen(port);
	});

	beforeEach(() => {
		uri = new URL("http://localhost");
		uri.port = `${port}`;
	});

	afterAll(async () => {
		server.close();
	});

	it("formData", async () => {
		uri.pathname = "/anything";
		const result = await fletcher.json(uri.href, {
			formData: { baz: "quz", foo: "bar" },
		});

		const expected = {
			body: "baz=quz&foo=bar",
			headers: expect.objectContaining({
				"content-type": "application/x-www-form-urlencoded",
			}),
			method: "POST",
		};
		expect(result).toStrictEqual(expected);
	});

	it("formUrlEncoded", async () => {
		uri.pathname = "/anything";
		const actual = await fletcher.json(uri.href, {
			formUrlEncoded: { baz: "quz", foo: "bar" },
		});

		const expected = {
			body: "baz=quz&foo=bar",
			headers: expect.objectContaining({
				"content-type": "application/x-www-form-urlencoded",
			}),
			method: "POST",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("jsonData", async () => {
		uri.pathname = "/anything";
		const result = await fletcher.json(uri.href, {
			jsonData: { baz: "quz", foo: "bar" },
		});

		const expected = {
			body: '{"baz":"quz","foo":"bar"}',
			headers: expect.objectContaining({
				"content-type": "application/json",
			}),
			method: "POST",
		};
		expect(result).toStrictEqual(expected);
	});
});
