import { $ } from "@tuplo/shell";

async function main() {
	await $`rm -rf dist`;

	const flags = ["--project tsconfig.build.json", "--watch"];
	await $`tsc ${flags}`;
}

main();
