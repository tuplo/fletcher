import $ from "cheerio";

import { server, getRandomPort } from "src/mocks";

import fletcher from "./index";

describe("inline scripts", () => {
	let url: URL;
	let port: number;

	beforeAll(async () => {
		port = await getRandomPort();
		server.listen(port);
	});

	beforeEach(() => {
		url = new URL("http://localhost");
		url.port = `${port}`;
	});

	afterAll(async () => {
		server.close();
	});

	it("evaluates a script and returns its global scope", async () => {
		url.pathname = "/file/inline-script.html";
		interface IPageData {
			pageData: { foo: string };
		}
		const actual = await fletcher.script<IPageData>(url.href, {
			scriptPath: "script:nth-of-type(1)",
		});

		const expected = { pageData: { foo: "bar" } };
		expect(actual).toMatchObject(expected);
	});

	it("uses a function to find a script element", async () => {
		url.pathname = "/file/inline-script.html";
		const actual = await fletcher.script(url.href, {
			scriptFindFn: (script: cheerio.Element) =>
				/findThisVar/.test($(script).html() || ""),
		});

		const expected = { findThisVar: true };
		expect(actual).toStrictEqual(expected);
	});

	it("throws if options are not provided", async () => {
		url.pathname = "/file/inline-script.html";
		const actual = async () => {
			await fletcher.script(url.href);
		};

		const expected = new Error(
			"fletch.script: scriptPath or scriptFindFn are required"
		);
		return expect(actual).rejects.toThrow(expected);
	});

	it("should return an empty object if script element is empty", async () => {
		url.pathname = "/file/inline-script.html";
		const actual = await fletcher.script(url.href, {
			scriptPath: "#empty-script",
		});

		expect(actual).toStrictEqual({});
	});
});
