import $ from "cheerio";
import vm from "node:vm";

import type { IFletcherUserOptions } from "src/fletcher.d";

export function getScript<T>(
	$page: cheerio.Cheerio,
	userOptions: Partial<IFletcherUserOptions> = {}
) {
	const { scriptPath, scriptFindFn, scriptSandbox } = userOptions;
	if (!scriptPath && !scriptFindFn)
		throw new Error("fletch.script: scriptPath or scriptFindFn are required");

	let $el: cheerio.Cheerio | null | undefined = null;
	if (scriptPath) {
		$el = $page.find(scriptPath);
	} else if (scriptFindFn) {
		const elScript = $page.find("script").toArray().find(scriptFindFn);
		$el = $(elScript);
	}

	if (!$el || $el?.length === 0) {
		throw new Error("fletch.script: script element not found");
	}

	const src = $el.html() || "";
	const code = new vm.Script(src);
	const sandbox = scriptSandbox || {};
	vm.createContext(sandbox);
	code.runInContext(sandbox, { displayErrors: false });

	return sandbox as T;
}
