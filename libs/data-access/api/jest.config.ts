/* eslint-disable */
export default {
	displayName: "data-access-api",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "node",
	coverageDirectory: "../../../coverage/libs/data-access/api",
	preset: "../../../jest.preset.js",
	moduleNameMapper: {
		"^@xenova/transformers$":
			"<rootDir>/../../../libs/util/testing/src/lib/xenova-transformers.mock.ts"
	}
};
