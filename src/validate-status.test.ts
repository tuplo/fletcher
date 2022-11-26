import fletcher from "./index";

const fletchSpy = jest.fn();
jest.mock("./services/fletch", () => ({
	__esModule: true,
	fletch: (url: string) => fletchSpy(url),
}));

describe("validateStatus", () => {
	it("validates status with default logic", async () => {
		fletchSpy.mockResolvedValue({
			status: 404,
			statusText: "Not Found",
		});

		const test = () => fletcher.text("http://localhost", { retry: false });

		await expect(test).rejects.toThrow("404: Not Found");
	});

	it("validates status with custom logic (error)", async () => {
		fletchSpy.mockResolvedValue({
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
		fletchSpy.mockResolvedValue({
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
