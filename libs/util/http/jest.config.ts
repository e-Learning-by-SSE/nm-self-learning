/* eslint-disable */
export default {
	displayName: "util-http",
	preset: "../../../jest.preset.js",
	globals: {},
	testEnvironment: "node",
	transform: {
		"^.+\\.[tj]sx?$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.spec.json"
			}
		]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/util/http"
};
