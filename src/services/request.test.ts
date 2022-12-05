import { STATUS_CODES } from "node:http";

import type { IFletcherOptions } from "src/fletcher";
import { getRandomPort, server } from "src/mocks";
import { server as httpsServer } from "src/mocks/https";

import { request } from "./request";

describe("request", () => {
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

	describe("body", () => {
		it("includes body on request", async () => {
			url.pathname = "/anything";
			const body = JSON.stringify({ foo: "bar" });
			const options = { method: "POST", body } as IFletcherOptions;
			const actual = await request(url.href, options);

			const expected = {
				headers: {
					date: "2022-12-25T00:00:00.000Z",
				},
				status: 200,
				statusText: "OK",
				text: expect.anything(),
			};
			expect(actual).toMatchObject(expected);

			const req = await actual.text();

			const expectedRequest = {
				method: "POST",
				body: '{"foo":"bar"}',
				headers: {
					accept: "application/json, text/plain, */*",
					"accept-encoding": "gzip, compress, deflate, br",
					connection: expect.anything(),
					"content-length": "13",
					"content-type": "application/x-www-form-urlencoded",
					host: `localhost:${port}`,
					"user-agent": expect.anything(),
				},
			};
			expect(JSON.parse(req)).toStrictEqual(expectedRequest);
		});
	});

	describe("encoding", () => {
		it.each<BufferEncoding>(["latin1", "utf8", "binary", "ucs2", "utf16le"])(
			"sets response encoding: %s",
			async (encoding) => {
				url.pathname = `/encoding/${encoding}`;
				const response = await request(url.href, { encoding });
				const actual = await response.text();

				const expected = "Opinião";
				expect(actual).toBe(expected);
			}
		);
	});

	describe("headers", () => {
		it("includes custom headers", async () => {
			url.pathname = "/anything";
			const options = { headers: { foo: "bar", baz: "buz" } };
			const response = await request(url.href, options);
			const body = await response.text();
			const actual = JSON.parse(body);

			const expected = { foo: "bar", baz: "buz" };
			expect(actual.headers).toMatchObject(expected);
		});
	});

	describe("redirects", () => {
		it("follows a redirect", async () => {
			url.pathname = "/redirect-to";
			url.searchParams.append("statusCode", "302");
			url.searchParams.append("url", "/redirected");
			const actual = await request(url.href);
			const body = await actual.text();

			const expected = { url: "/redirected" };
			expect(actual.status).toBe(200);
			expect(body).toStrictEqual(expected);
		});

		it("doesn't follow redirects", async () => {
			url.pathname = "/redirect-to";
			url.searchParams.append("statusCode", "302");
			url.searchParams.append("url", "/redirected");
			const actual = await request(url.href, { maxRedirections: 0 });

			expect(actual.status).toBe(302);
			expect(actual.statusText).toBe("Found");
		});
	});

	describe("errors", () => {
		it("includes the URL on an errored response", async () => {
			url.pathname = "/error";
			const result = await request(url.href);

			const expected = {
				status: 500,
				statusText: `Internal Server Error - http://localhost:${port}/error`,
			};
			expect(result).toMatchObject(expected);
		});
	});

	describe("rejectUnauthorized", () => {
		let httpsUrl: URL;
		let httpsPort: number;

		beforeAll(async () => {
			httpsPort = await getRandomPort();
			httpsServer.listen(httpsPort);
		});

		beforeEach(() => {
			httpsUrl = new URL("https://localhost");
			httpsUrl.port = `${httpsPort}`;
		});

		afterAll(async () => {
			httpsServer.close();
		});

		it("rejects unauthorized", async () => {
			const actual = await request(httpsUrl.href, {
				rejectUnauthorized: true,
			});

			const expected = `unable to verify the first certificate - https://localhost:${httpsPort}/`;
			expect(actual.statusText).toBe(expected);
		});

		it("doesn't reject unauthorized", async () => {
			const actual = await request(httpsUrl.href, {
				rejectUnauthorized: false,
			});

			const expected = "OK";
			expect(actual.statusText).toBe(expected);
		});
	});

	describe("validate status", () => {
		it.each([200, 201])(
			"handles success status codes: %s",
			async (statusCode) => {
				url.pathname = `/status-code/${statusCode}`;
				const actual = await request(url.href);

				const expected = STATUS_CODES[statusCode];
				expect(actual.status).toBe(statusCode);
				expect(actual.statusText).toBe(expected);
			}
		);

		it.each([301, 302, 400, 401, 404, 500])(
			"handles error status codes: %s",
			async (statusCode) => {
				url.pathname = `/status-code/${statusCode}`;
				const actual = await request(url.href);

				const expected = `${STATUS_CODES[statusCode]} - http://localhost:${port}/status-code/${statusCode}`;
				expect(actual.status).toBe(statusCode);
				expect(actual.statusText).toBe(expected);
			}
		);

		it("custom callback for validating status code", async () => {
			url.pathname = "/status-code/500";
			const options = {
				validateStatus: (statusCode: number) => statusCode === 500,
			} as IFletcherOptions;
			const actual = await request(url.href, options);

			const expected = "Internal Server Error";
			expect(actual.status).toBe(500);
			expect(actual.statusText).toBe(expected);
		});
	});

	describe("proxy", () => {
		// eslint-disable-next-line jest/no-disabled-tests
		it.skip("uses a proxy", async () => {
			url.pathname = "/ip";
			const proxy = {
				username: "<username>",
				password: "<password>",
				host: "<ip>",
				port: 666,
			};

			const u = new URL("https://httpbin.org/ip");
			const response = await request(u.href, { proxy });
			const body = await response.text();
			const actual = JSON.parse(body);

			expect(actual.origin).toBe(proxy.host);
		});
	});
});
