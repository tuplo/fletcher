import { server, getRandomPort } from "src/mocks";

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
			formData: { foo: "bar", baz: "quz" },
		});

		const expected = {
			method: "POST",
			headers: expect.objectContaining({
				"content-type": "application/x-www-form-urlencoded",
			}),
			body: "foo=bar&baz=quz",
		};
		expect(result).toStrictEqual(expected);
	});

	it("formUrlEncoded", async () => {
		uri.pathname = "/anything";
		const actual = await fletcher.json(uri.href, {
			formUrlEncoded: { foo: "bar", baz: "quz" },
		});

		const expected = {
			method: "POST",
			headers: expect.objectContaining({
				"content-type": "application/x-www-form-urlencoded",
			}),
			body: "foo=bar&baz=quz",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("jsonData", async () => {
		uri.pathname = "/anything";
		const result = await fletcher.json(uri.href, {
			jsonData: { foo: "bar", baz: "quz" },
		});

		const expected = {
			method: "POST",
			headers: expect.objectContaining({
				"content-type": "application/json",
			}),
			body: '{"foo":"bar","baz":"quz"}',
		};
		expect(result).toStrictEqual(expected);
	});
});
