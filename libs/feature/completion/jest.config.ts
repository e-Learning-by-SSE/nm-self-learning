/* eslint-disable */
export default {
	displayName: "feature-completion",
	preset: "../../../jest.preset.js",
	testEnvironment: "node",
	coverageDirectory: "../../../coverage/libs/feature/completion",
	moduleNameMapper: {
		"^@xenova/transformers$":
			"<rootDir>/../../../libs/util/testing/src/lib/xenova-transformers.mock.ts"
	}
};
