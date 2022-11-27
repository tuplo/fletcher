import { server, getRandomPort } from "src/mocks";

import fletcher from "./index";

describe("body formats", () => {
	let url: URL;
	let port: number;

	beforeAll(async () => {
		port = await getRandomPort();
		server.listen(port);
	});

	beforeEach(() => {
		url = new URL("http://localhost");
		url.port = `${port}`;
	});

	afterAll(async () => {
		server.close();
	});

	it("formData", async () => {
		url.pathname = "/anything";
		const result = await fletcher.json(url.href, {
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
		url.pathname = "/anything";
		const actual = await fletcher.json(url.href, {
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
		url.pathname = "/anything";
		const result = await fletcher.json(url.href, {
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
