import vm from "node:vm";

import $, { type AnyNode, type Cheerio } from "cheerio";

import { type IFletcherUserOptions } from "../fletcher.d";

export function getScript<T>(
	$page: Cheerio<AnyNode>,
	userOptions: Partial<IFletcherUserOptions> = {}
) {
	const { scriptFindFn, scriptPath, scriptSandbox } = userOptions;
	if (!scriptPath && !scriptFindFn) {
		throw new Error("fletch.script: scriptPath or scriptFindFn are required");
	}

	let $el: Cheerio<AnyNode> | null | undefined;
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
