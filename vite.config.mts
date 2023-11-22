import { defineConfig } from "vitest/config";
import path from "node:path";

process.env.DB_FILE_CMS = ":memory:";

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			reporter: ["lcov"],
		},
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, "./src/"),
		},
	},
});
