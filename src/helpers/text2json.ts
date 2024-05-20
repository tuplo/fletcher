export function text2json(input: string) {
	let json;
	try {
		json = JSON.parse(input);
		return json;
	} catch {
		return structuredClone(input);
	}
}
