/* eslint-disable */
export default {
	displayName: "feature-admin",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	preset: "../../../jest.preset.js",
	coverageDirectory: "../../../coverage/libs/feature/admin",
	moduleNameMapper: {
		"^@xenova/transformers$":
			"<rootDir>/../../../libs/util/testing/src/lib/xenova-transformers.mock.ts",
		"^pdf-parse$": "<rootDir>/../../../libs/util/testing/src/lib/pdf-parse.mock.ts"
	}
};
