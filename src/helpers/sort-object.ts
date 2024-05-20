export function sortObject(obj: unknown): unknown {
	if (Array.isArray(obj)) {
		return obj.map((item) => sortObject(item));
	}

	if (typeof obj === "object" && obj !== null) {
		const keys = Object.keys(obj);
		const o = {};
		for (const key of keys.sort()) {
			// @ts-expect-error foobar
			o[key] = sortObject(obj[key]);
		}
		return o;
	}

	return obj;
}
