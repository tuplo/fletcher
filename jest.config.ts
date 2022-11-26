export default {
	roots: ["<rootDir>/src"],
	transform: {
		"^.+\\.(t|j)sx?$": "ts-jest",
	},
	moduleNameMapper: {
		"^src/(.*)": "<rootDir>/src/$1",
	},
	setupFilesAfterEnv: ["./jest.setup.ts"],
};
