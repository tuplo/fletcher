import { server, getRandomPort } from "src/mocks";

import fletcher from "./index";

describe("fletcher - HTTP client", () => {
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

	it("simple text (GET)", async () => {
		url.pathname = "/file/simple.html";
		const result = await fletcher.text(url.href);

		const expected = /Simple heading/;
		expect(result).toMatch(expected);
	});

	it("simple html (GET)", async () => {
		url.pathname = "/file/simple.html";
		const $page = await fletcher.html(url.href);
		const result = $page.find("h1").text();

		const expected = "Simple heading";
		expect(result).toBe(expected);
	});

	it("simple json (GET)", async () => {
		url.pathname = "/file/simple.json";
		const result = await fletcher.json(url.href);

		const expected = { foo: "bar" };
		expect(result).toStrictEqual(expected);
	});

	it("simple json (GET) with generic type", async () => {
		url.pathname = "/file/simple.json";
		type FooBar = { foo: string };
		const result = await fletcher.json<FooBar>(url.href);

		const expected: FooBar = { foo: "bar" };
		expect(result).toStrictEqual(expected);
	});

	it("json-ld (GET)", async () => {
		url.pathname = "/file/json-ld.html";
		const result = await fletcher.jsonld(url.href);

		const expected = {
			"@context": "http://schema.org",
			"@type": "MovieTheater",
			address:
				"Pacific Fair Shopping Centre, Level 1, Hooker Blvd, Broadbeach, QLD, 4218",
			brand: "Event Cinemas",
			currenciesAccepted: "AUD",
			geo: {
				"@type": "GeoCoordinates",
				latitude: "-28.0343100000",
				longitude: "153.4303300000",
				postalCode: "4218",
			},
			image: "https://cdn.eventcinemas.com.au/cdn/content/img/ec-logo.svg",
			logo: "https://cdn.eventcinemas.com.au/cdn/content/img/ec-logo.svg",
			name: "Pacific Fair",
			openingHours: null,
			publicAccess: true,
			telephone: "(07) 5504 1401",
			url: "https://www.eventcinemas.com.au/Cinema/Pacific-Fair",
		};
		expect(result).toHaveLength(1);
		expect(result[0]).toStrictEqual(expected);
	});

	it("returns the headers on a request", async () => {
		url.pathname = "/headers";
		const actual = await fletcher.headers(url.href);

		const expected = { foo: "bar" };
		expect(actual).toMatchObject(expected);
	});

	it("returns statusText on Error message", async () => {
		url.pathname = "/error";
		const fn = async () => fletcher.json(url.href, { retry: false });

		const expected = `500: Internal Server Error - http://localhost:${port}/error`;
		await expect(fn).rejects.toThrow(expected);
	});

	it("requests an URL with special characters", async () => {
		url.pathname = "/drácula";
		const actual = await fletcher.json(url.href);

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	// eslint-disable-next-line jest/no-disabled-tests
	it.skip("encoding", async () => {
		const url2 = "https://www.rtp.pt/programa/tv/p34454";
		const result = await fletcher.text(url2, { encoding: "latin1" });

		expect(result).toMatch(/programação/);
	});
});
