import { sortObject } from "./sort-object";

describe("serializeObject", () => {
	it("deep sorts by key", () => {
		const obj = {
			a: [{ b: "bar", z: "foo" }],
			b: "bar",
			z: "foo",
		};
		const actual = sortObject(obj);

		const expected = {
			a: [{ b: "bar", z: "foo" }],
			b: "bar",
			z: "foo",
		};
		expect(actual).toStrictEqual(expected);
	});
});
