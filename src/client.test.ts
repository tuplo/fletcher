import { getRandomPort, server } from "src/mocks";

import fletcher from "./index";

describe("creates an instance with options", () => {
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
		url.pathname = "/anything";
		const client = fletcher.create({
			headers: { foo: "bar", "user-agent": "foobar" },
		});
		const response = await client.text(url.href);
		const actual = JSON.parse(response);

		const expected = {
			headers: {
				foo: "bar",
				"user-agent": "foobar",
			},
		};
		expect(actual).toMatchObject(expected);
	});

	it("simple html (GET)", async () => {
		url.pathname = "/file/simple.html";
		const client = fletcher.create({ headers: { foo: "bar" } });
		const $actual = await client.html(url.href);

		expect($actual.find("h1").text()).toBe("Simple heading");
	});

	it("simple json (GET)", async () => {
		url.pathname = "/file/simple.json";
		const client = fletcher.create({ headers: { foo: "bar" } });
		const actual = await client.json(url.href);

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("simple json (GET) with generic type", async () => {
		url.pathname = "/file/simple.json";
		const client = fletcher.create({ headers: { foo: "bar" } });
		interface IFooBar {
			foo: string;
		}
		const actual = await client.json<IFooBar>(url.href);

		const expected: IFooBar = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("accepts new options but keeps initial config", async () => {
		url.pathname = "/anything";
		const client = fletcher.create({ headers: { foo: "bar" } });
		const actual = await client.json(url.href, { headers: { baz: "buz" } });

		const expected = { headers: { foo: "bar", baz: "buz" } };
		expect(actual).toMatchObject(expected);
	});

	it("accepts calling create with no parameters", async () => {
		url.pathname = "/anything";
		const client = fletcher.create();
		const actual = await client.json(url.href, { headers: { baz: "buz" } });

		const expected = { headers: { baz: "buz" } };
		expect(actual).toMatchObject(expected);
	});
});
