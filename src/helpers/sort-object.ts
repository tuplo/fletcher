export function sortObject(obj: unknown): unknown {
	if (Array.isArray(obj)) {
		return obj.map((item) => sortObject(item));
	}

	if (typeof obj === "object" && obj !== null) {
		return Object.keys(obj)
			.sort((a, b) => a.localeCompare(b))
			.reduce((acc, key) => {
				// @ts-expect-error foobar
				acc[key] = sortObject(obj[key] as unknown);
				return acc;
			}, {} as Record<string, unknown>);
	}

	return obj;
}
