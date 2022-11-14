import $ from "cheerio";

export function getJsonLd<T>($page: cheerio.Cheerio) {
	return $page
		.find('script[type="application/ld+json"]')
		.toArray()
		.map((el) => {
			const $el = $(el);
			// make sure no new lines inside values
			const src = ($el.html() || "").split("\n").join(" ");
			try {
				return JSON.parse(src) as T;
			} catch (err) {
				return {};
			}
		});
}
