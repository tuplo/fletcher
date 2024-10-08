import * as $ from "cheerio";
import type { Element } from "domhandler";

import { getRandomPort, server } from "src/mocks";

import fletcher from "./index";

describe("inline scripts", () => {
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

	it("evaluates a script and returns its global scope", async () => {
		uri.pathname = "/file/inline-script.html";
		type IPageData = {
			pageData: { foo: string };
		};
		const actual = await fletcher.script<IPageData>(uri.href, {
			scriptPath: "script:nth-of-type(1)",
		});

		const expected = { pageData: { foo: "bar" } };
		expect(actual).toMatchObject(expected);
	});

	it("uses a function to find a script element", async () => {
		uri.pathname = "/file/inline-script.html";
		const actual = await fletcher.script(uri.href, {
			scriptFindFn: (script: Element) => {
				const src = $.load(script).text() || "";
				return /findThisVar/.test(src);
			},
		});

		const expected = { findThisVar: true };
		expect(actual).toStrictEqual(expected);
	});

	it("throws if options are not provided", async () => {
		uri.pathname = "/file/inline-script.html";
		const actual = async () => {
			await fletcher.script(uri.href);
		};

		const expected = new Error(
			"fletch.script: scriptPath or scriptFindFn are required"
		);
		return expect(actual).rejects.toThrow(expected);
	});

	it("should return an empty object if script element is empty", async () => {
		uri.pathname = "/file/inline-script.html";
		const actual = await fletcher.script(uri.href, {
			scriptPath: "#empty-script",
		});

		expect(actual).toStrictEqual({});
	});
});
