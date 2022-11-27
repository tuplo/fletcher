import "zx/globals";

async function main() {
	await $`rm -rf dist`;
	await $`tsc --project tsconfig.build.json`;
	await $`cp src/fletcher.d.ts dist/fletcher.d.ts`;
	await $`rm -rf dist/mocks`;
}

main();
