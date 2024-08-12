import * as shell from "@tuplo/shell";

async function main() {
	const $ = shell.$({ verbose: true });

	await $`rm -rf dist`;
	await $`tsc --project tsconfig.build.json`;
	await $`tsup src/index.ts`;

	await $`cp src/fletcher.d.ts dist/fletcher.d.ts`;
	await $`rm -rf dist/mocks`;
}

main();
