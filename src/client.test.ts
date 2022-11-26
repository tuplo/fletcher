import fletcher from "./index";

const fletchSpy = jest.fn();
jest.mock("./services/fletch", () => ({
	__esModule: true,
	fletch: (url: string, options: unknown) => fletchSpy(url, options),
}));

describe("creates an instance with options", () => {
	afterEach(() => {
		fletchSpy.mockClear();
	});

	afterAll(() => {
		fletchSpy.mockRestore();
	});

	it("simple text (GET)", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => "foobar",
		});

		const client = fletcher.create({ headers: { foo: "bar" } });
		await client.text("http://localhost");

		const expected = { foo: "bar" };
		expect(fletchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});

	it("simple html (GET)", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => "<body></body>",
		});

		const client = fletcher.create({ headers: { foo: "bar" } });
		await client.html("http://localhost");

		const expected = { foo: "bar" };
		expect(fletchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});

	it("simple json (GET)", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ baz: "buz" }),
		});

		const client = fletcher.create({ headers: { foo: "bar" } });
		const result = await client.json("http://localhost");

		const expected = { foo: "bar" };
		expect(fletchSpy.mock.calls[0][1].headers).toMatchObject(expected);
		expect(result).toStrictEqual({ baz: "buz" });
	});

	it("simple json (GET) with generic type", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ baz: "buz" }),
		});

		const client = fletcher.create({ headers: { foo: "bar" } });
		type FooBar = { foo: string };
		const result = await client.json<FooBar>("http://localhost");

		const expected: FooBar = { foo: "bar" };
		expect(fletchSpy.mock.calls[0][1].headers).toMatchObject(expected);
		expect(result).toStrictEqual({ baz: "buz" });
	});

	it("accepts new options but keeps initial config", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => "foobar",
		});

		const client = fletcher.create({ headers: { foo: "bar" } });
		await client.html("http://localhost", { headers: { baz: "buz" } });

		const expected = { foo: "bar", baz: "buz" };
		expect(fletchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});

	it("accepts calling create with no parameters", async () => {
		fletchSpy.mockResolvedValue({
			status: 200,
			text: async () => "<body></body>",
		});

		const client = fletcher.create();
		await client.html("http://localhost", { headers: { baz: "buz" } });

		const expected = { baz: "buz" };
		expect(fletchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});
});
