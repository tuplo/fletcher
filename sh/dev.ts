import "zx/globals";

async function main() {
	await $`rm -rf dist`;

	const flags = ["--project tsconfig.build.json", "--watch"].flatMap((f) =>
		f.split(" ")
	);
	await $`tsc ${flags}`;
}

main();
