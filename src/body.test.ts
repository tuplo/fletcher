import fletcher from "./index";

describe("body formats", () => {
	it("formData", async () => {
		const url = "https://fletcher.dev/body";
		const result = await fletcher.json(url, {
			formData: { foo: "bar", baz: "quz" },
		});

		const expected = {
			method: "POST",
			headers: expect.objectContaining({
				"content-type": "application/x-www-form-urlencoded",
			}),
			body: "foo=bar&baz=quz",
		};
		expect(result).toStrictEqual(expected);
	});

	it("formUrlEncoded", async () => {
		const url = "https://fletcher.dev/body";
		const actual = await fletcher.json(url, {
			formUrlEncoded: { foo: "bar", baz: "quz" },
		});

		const expected = {
			method: "POST",
			headers: expect.objectContaining({
				"content-type": "application/x-www-form-urlencoded",
			}),
			body: "foo=bar&baz=quz",
		};
		expect(actual).toStrictEqual(expected);
	});

	it("jsonData", async () => {
		const url = "https://fletcher.dev/body";
		const result = await fletcher.json(url, {
			jsonData: { foo: "bar", baz: "quz" },
		});

		const expected = {
			method: "POST",
			headers: expect.objectContaining({
				"content-type": "application/json",
			}),
			body: '{"foo":"bar","baz":"quz"}',
		};
		expect(result).toStrictEqual(expected);
	});
});
