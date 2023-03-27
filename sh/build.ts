import "zx/globals";

async function main() {
	await $`rm -rf dist`;
	await $`tsc --project tsconfig.build.json`;

	const flags = [
		"--bundle",
		"--platform=node",
		"--external:puppeteer-core",
		"--external:axios",
		"--external:hpagent",
	];

	await $`esbuild src/cjs/index.cjs --outfile=dist/index.cjs ${flags}`;
	await $`esbuild src/index.ts --format=esm --outfile=dist/index.mjs ${flags}`;

	await $`cp src/fletcher.d.ts dist/fletcher.d.ts`;
	await $`rm -rf dist/mocks`;
}

main();
