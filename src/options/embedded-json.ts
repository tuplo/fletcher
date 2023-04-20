import type { IFletcherUserOptions } from "../fletcher.d";

export function getEmbeddedJson<T>(
	$page: cheerio.Cheerio,
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
	} catch (e) {
		// @ts-expect-error - e is not an Error
		throw new Error(`fletch.embeddedJson: ${e.message}`);
	}

	return json;
}
