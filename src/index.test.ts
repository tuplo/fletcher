import { server, getRandomPort } from "src/mocks";

import fletcher from "./index";

describe("fletcher - HTTP client", () => {
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

	it("simple text (GET)", async () => {
		uri.pathname = "/file/simple.html";
		const result = await fletcher.text(uri.href);

		const expected = /Simple heading/;
		expect(result).toMatch(expected);
	});

	it("simple html (GET)", async () => {
		uri.pathname = "/file/simple.html";
		const $page = await fletcher.html(uri.href);
		const result = $page.find("h1").text();

		const expected = "Simple heading";
		expect(result).toBe(expected);
	});

	it("simple json (GET)", async () => {
		uri.pathname = "/file/simple.json";
		const result = await fletcher.json(uri.href);

		const expected = { foo: "bar" };
		expect(result).toStrictEqual(expected);
	});

	it("simple json (GET) with generic type", async () => {
		uri.pathname = "/file/simple.json";
		type FooBar = { foo: string };
		const result = await fletcher.json<FooBar>(uri.href);

		const expected: FooBar = { foo: "bar" };
		expect(result).toStrictEqual(expected);
	});

	it("json-ld (GET)", async () => {
		uri.pathname = "/file/json-ld.html";
		const result = await fletcher.jsonld(uri.href);

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
		uri.pathname = "/headers";
		const actual = await fletcher.headers(uri.href);

		const expected = { foo: "bar" };
		expect(actual).toMatchObject(expected);
	});

	it("returns statusText on Error message", async () => {
		uri.pathname = "/error";
		const fn = async () => fletcher.json(uri.href, { retry: false });

		const expected = `500: Internal Server Error - http://localhost:${port}/error`;
		await expect(fn).rejects.toThrow(expected);
	});

	it("requests an URL with special characters", async () => {
		uri.pathname = "/drácula";
		const actual = await fletcher.json(uri.href);

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it.skip("encoding", async () => {
		const url2 = "https://www.rtp.pt/programa/tv/p34454";
		const result = await fletcher.text(url2, { encoding: "latin1" });

		expect(result).toMatch(/programação/);
	});
});
