import * as $ from "cheerio";

import { getEmbeddedJson } from "./embedded-json";

describe("get embedded json", () => {
	it("finds an embedded json by selector", async () => {
		const html = `<html><script id="__NEXT_DATA__">{ "foo": "bar" }</script></html>`;
		const $page = $.load(html).root();
		const actual = getEmbeddedJson($page, {
			embeddedJsonSelector: "#__NEXT_DATA__",
		});

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("throws an error if the embedded json is not found", async () => {
		const html = `<html></html>`;
		const $page = $.load(html).root();
		const actual = () =>
			getEmbeddedJson($page, {
				embeddedJsonSelector: "#__NEXT_DATA__",
			});

		const expected = "fletch.embeddedJson: script element not found";
		expect(actual).toThrow(expected);
	});

	it("throws an error if the embedded json is not valid", async () => {
		const html = `<html><script id="__NEXT_DATA__">foobar</script></html>`;
		const $page = $.load(html).root();
		const actual = () =>
			getEmbeddedJson($page, {
				embeddedJsonSelector: "#__NEXT_DATA__",
			});

		expect(actual).toThrow();
	});
});
