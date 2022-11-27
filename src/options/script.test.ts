import $ from "cheerio";
import { getScript } from "./script";

describe("get script", () => {
	it("finds a script by path", async () => {
		const html = `
<html>
  <script id="my-script">
    var foo = 'bar'
  </script>
</html>    
    `;
		const $page = $.load(html).root();
		const options = { scriptPath: "#my-script" };
		const actual = getScript($page, options);

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("finds a script by finder function", async () => {
		const html = `
<html>
  <script id="my-script">
    var foo = 'bar'
  </script>
</html>    
    `;
		const $page = $.load(html).root();
		const options = {
			scriptFindFn: (s: cheerio.Element) =>
				/foo/.test($(s).html() || "unknown"),
		};
		const actual = getScript($page, options);

		const expected = { foo: "bar" };
		expect(actual).toStrictEqual(expected);
	});

	it("doesn't find a script by finder function (empty document)", async () => {
		const html = "<html />";
		const $page = $.load(html).root();
		const options = { scriptPath: "#my-script" };
		const actual = () => getScript($page, options);

		expect(actual).toThrow("fletch.script: script element not found");
	});

	it("doesn't find a script by path (empty document)", async () => {
		const html = "<html />";
		const $page = $.load(html).root();
		const options = {
			scriptFindFn: (s: cheerio.Element) =>
				/foo/.test($(s).html() || "unknown"),
		};
		const actual = () => getScript($page, options);

		expect(actual).toThrow("fletch.script: script element not found");
	});

	it("handles finding an empty script", async () => {
		const html = "<html><script id='my-script'></script></html>";
		const $page = $.load(html).root();
		const options = { scriptPath: "#my-script" };
		const actual = getScript($page, options);

		expect(actual).toStrictEqual({});
	});
});
