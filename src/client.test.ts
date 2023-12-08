import { getRandomPort, server } from "src/mocks";

import fletcher from "./index";

describe("creates an instance with options", () => {
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
		uri.pathname = "/anything";
		const client = fletcher.create({
			headers: { foo: "bar", "user-agent": "foobar" },
		});
		const response = await client.text(uri.href);
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
		uri.pathname = "/file/simple.html";
		const client = fletcher.create({ headers: { foo: "bar" } });
		const $actual = await client.html(uri.href);

		expect($actual.find("h1").text()).toBe("Simple heading");
	});

	it("simple json (GET)", async () => {
		uri.pathname = "/file/simple.json";
		const client = fletcher.create({ headers: { foo: "bar" } });
		const actual = await client.json(uri.href);

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("simple json (GET) with generic type", async () => {
		uri.pathname = "/file/simple.json";
		const client = fletcher.create({ headers: { foo: "bar" } });
		type IFooBar = {
			foo: string;
		};
		const actual = await client.json<IFooBar>(uri.href);

		const expected: IFooBar = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("accepts new options but keeps initial config", async () => {
		uri.pathname = "/anything";
		const client = fletcher.create({ headers: { foo: "bar" } });
		const actual = await client.json(uri.href, { headers: { baz: "buz" } });

		const expected = { headers: { foo: "bar", baz: "buz" } };
		expect(actual).toMatchObject(expected);
	});

	it("accepts calling create with no parameters", async () => {
		uri.pathname = "/anything";
		const client = fletcher.create();
		const actual = await client.json(uri.href, { headers: { baz: "buz" } });

		const expected = { headers: { baz: "buz" } };
		expect(actual).toMatchObject(expected);
	});
});
