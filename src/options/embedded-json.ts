import * as $ from "cheerio";
import type { AnyNode } from "domhandler";

import { type IFletcherUserOptions } from "../fletcher.d";

export function getEmbeddedJson<T>(
	$page: $.Cheerio<AnyNode>,
	userOptions: Partial<IFletcherUserOptions> = {}
) {
	const { embeddedJsonSelector } = userOptions;
	if (!embeddedJsonSelector) {
		throw new Error("fletch.embeddedJson: embeddedJsonSelector is required");
	}

	const $el = $page.find(embeddedJsonSelector);
	if (!$el || $el?.length === 0) {
		throw new Error("fletch.embeddedJson: script element not found");
	}

	const src = $el.html() || "";
	let json: T;
	try {
		json = JSON.parse(src) as T;
	} catch (error) {
		// @ts-expect-error - e is not an Error
		throw new Error(`fletch.embeddedJson: ${error.message}`);
	}

	return json;
}
