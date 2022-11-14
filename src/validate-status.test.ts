import fletcher from "./index";

const fetchSpy = jest.fn();
jest.mock("./services/fetch", () => ({
	__esModule: true,
	fetch: (url: string) => fetchSpy(url),
}));

describe("validateStatus", () => {
	it("validates status with default logic", async () => {
		fetchSpy.mockResolvedValue({
			status: 404,
			statusText: "Not Found",
		});

		const test = () => fletcher.text("http://localhost", { retry: false });

		await expect(test).rejects.toThrow("404: Not Found");
	});

	it("validates status with custom logic (error)", async () => {
		fetchSpy.mockResolvedValue({
			status: 202,
			statusText: "Custom error",
		});

		const test = () =>
			fletcher.text("http://localhost", {
				retry: false,
				validateStatus: (status) => status !== 202,
			});

		await expect(test).rejects.toThrow("202: Custom error");
	});

	it("accepts undefined as option (default behavior)", async () => {
		fetchSpy.mockResolvedValue({
			status: 500,
			statusText: "Internal Server Error",
		});

		const test = () =>
			fletcher.text("http://localhost", {
				retry: false,
				validateStatus: undefined,
			});

		await expect(test).rejects.toThrow("500: Internal Server Error");
	});
});
