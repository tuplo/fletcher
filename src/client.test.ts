import fletcher from './index';

const fetchSpy = jest.fn();
jest.mock('./lib/fetch', () => ({
	__esModule: true,
	fetch: (url: string, options: unknown) => fetchSpy(url, options),
}));

describe('creates an instance with options', () => {
	afterEach(() => {
		fetchSpy.mockClear();
	});

	afterAll(() => {
		fetchSpy.mockRestore();
	});

	it('simple text (GET)', async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => 'foobar',
		});

		const client = fletcher.create({ headers: { foo: 'bar' } });
		await client.text('http://localhost');

		const expected = { foo: 'bar' };
		expect(fetchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});

	it('simple html (GET)', async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => '<body></body>',
		});

		const client = fletcher.create({ headers: { foo: 'bar' } });
		await client.html('http://localhost');

		const expected = { foo: 'bar' };
		expect(fetchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});

	it('simple json (GET)', async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ baz: 'buz' }),
		});

		const client = fletcher.create({ headers: { foo: 'bar' } });
		const result = await client.json('http://localhost');

		const expected = { foo: 'bar' };
		expect(fetchSpy.mock.calls[0][1].headers).toMatchObject(expected);
		expect(result).toStrictEqual({ baz: 'buz' });
	});

	it('simple json (GET) with generic type', async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => JSON.stringify({ baz: 'buz' }),
		});

		const client = fletcher.create({ headers: { foo: 'bar' } });
		type FooBar = { foo: string };
		const result = await client.json<FooBar>('http://localhost');

		const expected: FooBar = { foo: 'bar' };
		expect(fetchSpy.mock.calls[0][1].headers).toMatchObject(expected);
		expect(result).toStrictEqual({ baz: 'buz' });
	});

	it('accepts new options but keeps initial config', async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => 'foobar',
		});

		const client = fletcher.create({ headers: { foo: 'bar' } });
		await client.html('http://localhost', { headers: { baz: 'buz' } });

		const expected = { foo: 'bar', baz: 'buz' };
		expect(fetchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});

	it('accepts calling create with no parameters', async () => {
		fetchSpy.mockResolvedValue({
			status: 200,
			text: async () => '<body></body>',
		});

		const client = fletcher.create();
		await client.html('http://localhost', { headers: { baz: 'buz' } });

		const expected = { baz: 'buz' };
		expect(fetchSpy.mock.calls[0][1].headers).toMatchObject(expected);
	});
});
