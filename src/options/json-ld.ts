import * as $ from "cheerio";
import type { AnyNode } from "domhandler";

export function getJsonLd<T>($page: $.Cheerio<AnyNode>) {
	return $page.find('script[type="application/ld+json"]').map((_, el) => {
		const $el = $.load(el);
		// make sure no new lines inside values
		const src = ($el.text() || "").split("\n").join(" ");
		try {
			return JSON.parse(src) as T;
		} catch {
			return {};
		}
	});
}
