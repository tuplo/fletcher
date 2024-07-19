import * as shell from "@tuplo/shell";

async function main() {
	const $ = shell.$({ verbose: true });

	await $`rm -rf dist`;
	await $`tsc --project tsconfig.build.json`;

	const flags = ["--bundle", "--platform=node", "--external:puppeteer-core"];

	await $`esbuild src/cjs/index.cjs --outfile=dist/index.cjs ${flags}`;

	flags.push(`--inject:${path.resolve("sh/cjs-shim.ts")}`);
	await $`esbuild src/index.ts --format=esm --outfile=dist/index.mjs ${flags}`;

	await $`cp src/fletcher.d.ts dist/fletcher.d.ts`;
	await $`rm -rf dist/mocks`;
}

main();
