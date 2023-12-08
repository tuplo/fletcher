import { server, getRandomPort } from "src/mocks";

import fletcher from "./index";

describe("validateStatus", () => {
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

	it("validates status with default logic", async () => {
		uri.pathname = "/status-code/404";
		const actual = () => fletcher.text(uri.href, { retry: false });

		const expected = `404: Not Found - http://localhost:${port}/status-code/404`;
		await expect(actual).rejects.toThrow(expected);
	});

	it("validates status with custom logic (error)", async () => {
		uri.pathname = "/status-code/202";
		uri.searchParams.append("statusText", "Custom error");
		const actual = () =>
			fletcher.text(uri.href, {
				retry: false,
				validateStatus: (status) => status !== 202,
			});

		const expected = "202: Custom error";
		await expect(actual).rejects.toThrow(expected);
	});

	it("accepts undefined as option (default behavior)", async () => {
		uri.pathname = "/status-code/500";
		const actual = () => fletcher.text(uri.href, { retry: false });

		const expected = "500: Internal Server Error";
		await expect(actual).rejects.toThrow(expected);
	});
});
