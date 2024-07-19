import fs from "node:fs/promises";
import path from "node:path";

import * as shell from "@tuplo/shell";

async function copyHeadersOrderFiles() {
	// eslint-disable-next-line unicorn/prefer-module
	const headerGenPkg = require.resolve("header-generator");
	const headerGenDir = path.dirname(headerGenPkg);

	const srcDir = path.join(headerGenDir, "data_files");
	const destDir = path.resolve("dist/data_files");
	await fs.mkdir(destDir, { recursive: true });

	const dir = await fs.opendir(srcDir);
	for await (const dirent of dir) {
		const src = path.join(srcDir, dirent.name);
		const dest = path.join(destDir, dirent.name);
		await fs.copyFile(src, dest);
	}
}

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

	await copyHeadersOrderFiles();
}

main();
