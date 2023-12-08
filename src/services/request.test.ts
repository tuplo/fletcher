import { STATUS_CODES } from "node:http";

import { type IFletcherOptions } from "src/fletcher";
import { getRandomPort, server } from "src/mocks";
import { server as httpsServer } from "src/mocks/https";

import { request } from "./request";

describe("request", () => {
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

	describe("body", () => {
		it("includes body on request", async () => {
			uri.pathname = "/anything";
			const body = JSON.stringify({ foo: "bar" });
			const options = { method: "POST", body } as IFletcherOptions;
			const actual = await request(uri.href, options);

			const expected = {
				headers: {
					date: "2022-12-25T00:00:00.000Z",
				},
				statusCode: 200,
				statusMessage: "OK",
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
				uri.pathname = `/encoding/${encoding}`;
				const response = await request(uri.href, { encoding });
				const actual = await response.text();

				const expected = "Opinião";
				expect(actual).toBe(expected);
			}
		);
	});

	describe("headers", () => {
		it("includes custom headers", async () => {
			uri.pathname = "/anything";
			const options = { headers: { foo: "bar", baz: "buz" } };
			const response = await request(uri.href, options);
			const body = await response.text();
			const actual = JSON.parse(body);

			const expected = { foo: "bar", baz: "buz" };
			expect(actual.headers).toMatchObject(expected);
		});
	});

	describe("redirects", () => {
		it("follows a redirect", async () => {
			uri.pathname = "/redirect-to";
			uri.searchParams.append("statusCode", "302");
			uri.searchParams.append("url", "/redirected");
			const actual = await request(uri.href);
			const body = await actual.text();
			const json = JSON.parse(body);

			const expected = { url: "/redirected" };
			expect(actual.statusCode).toBe(200);
			expect(json).toStrictEqual(expected);
		});

		it("doesn't follow redirects", async () => {
			uri.pathname = "/redirect-to";
			uri.searchParams.append("statusCode", "302");
			uri.searchParams.append("url", "/redirected");
			const actual = await request(uri.href, { maxRedirections: 0 });

			expect(actual.statusCode).toBe(302);
			expect(actual.statusMessage).toBe("Found");
		});
	});

	describe("errors", () => {
		it("includes the URL on an errored response", async () => {
			uri.pathname = "/error";
			const actual = await request(uri.href);

			const expected = {
				statusCode: 500,
				statusMessage: `Internal Server Error - http://localhost:${port}/error`,
			};
			expect(actual).toMatchObject(expected);
		});
	});

	describe("rejectUnauthorized", () => {
		let httpsUri: URL;
		let httpsPort: number;

		beforeAll(async () => {
			httpsPort = await getRandomPort();
			httpsServer.listen(httpsPort);
		});

		beforeEach(() => {
			httpsUri = new URL("https://localhost");
			httpsUri.port = `${httpsPort}`;
		});

		afterAll(async () => {
			httpsServer.close();
		});

		it("rejects unauthorized", async () => {
			const actual = await request(httpsUri.href, {
				rejectUnauthorized: true,
			});

			const expected = `certificate has expired - https://localhost:${httpsPort}/`;
			expect(actual.statusMessage).toBe(expected);
		});

		it("doesn't reject unauthorized", async () => {
			const actual = await request(httpsUri.href, {
				rejectUnauthorized: false,
			});

			const expected = "OK";
			expect(actual.statusMessage).toBe(expected);
		});
	});

	describe("validate status", () => {
		it.each([200, 201])(
			"handles success status codes: %s",
			async (statusCode) => {
				uri.pathname = `/status-code/${statusCode}`;
				const actual = await request(uri.href);

				const expected = STATUS_CODES[statusCode];
				expect(actual.statusCode).toBe(statusCode);
				expect(actual.statusMessage).toBe(expected);
			}
		);

		it.each([301, 302, 400, 401, 404, 500])(
			"handles error status codes: %s",
			async (statusCode) => {
				uri.pathname = `/status-code/${statusCode}`;
				const actual = await request(uri.href);

				const expected = `${STATUS_CODES[statusCode]} - http://localhost:${port}/status-code/${statusCode}`;
				expect(actual.statusCode).toBe(statusCode);
				expect(actual.statusMessage).toBe(expected);
			}
		);

		it("custom callback for validating status code", async () => {
			uri.pathname = "/status-code/500";
			const options = {
				validateStatus: (statusCode: number) => statusCode === 500,
			} as IFletcherOptions;
			const actual = await request(uri.href, options);

			const expected = "Internal Server Error";
			expect(actual.statusCode).toBe(500);
			expect(actual.statusMessage).toBe(expected);
		});
	});

	describe("proxy", () => {
		it.skip("uses a proxy", async () => {
			uri.pathname = "/ip";
			const proxy = {
				username: "<username>",
				password: "<password>",
				host: "<ip>",
				port: 666,
			};

			const uri2 = new URL("https://httpbin.org/ip");
			const response = await request(uri2.href, { proxy });
			const body = await response.text();
			const actual = JSON.parse(body);

			expect(actual.origin).toBe(proxy.host);
		});
	});

	describe("onAfterRequest", () => {
		it("calls postRequest (sync)", async () => {
			const onAfterRequestSpy = vi.fn();
			uri.pathname = "/anything";
			const options = { onAfterRequest: onAfterRequestSpy };
			await request(uri.href, options);

			const expected = {
				response: expect.anything(),
			};
			expect(onAfterRequestSpy).toHaveBeenCalledTimes(1);
			expect(onAfterRequestSpy).toHaveBeenCalledWith(expected);
		});

		it("calls postRequest (async)", async () => {
			const onAfterRequestSpy = vi.fn().mockReturnValue(
				new Promise((resolve) => {
					resolve(undefined);
				})
			);
			uri.pathname = "/anything";
			const options = { onAfterRequest: onAfterRequestSpy };
			await request(uri.href, options);

			const expected = {
				response: expect.anything(),
			};
			expect(onAfterRequestSpy).toHaveBeenCalledTimes(1);
			expect(onAfterRequestSpy).toHaveBeenCalledWith(expected);
		});
	});
});
