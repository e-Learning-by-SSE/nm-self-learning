/* eslint-disable */
export default {
	displayName: "site",
	coverageDirectory: "../../coverage/apps/site",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	preset: "../../jest.preset.js",
	moduleNameMapper: {
		"^@xenova/transformers$":
			"<rootDir>/../../libs/util/testing/src/lib/xenova-transformers.mock.ts",
		"^pdf-parse$": "<rootDir>/../../libs/util/testing/src/lib/pdf-parse.mock.ts"
	}
};
