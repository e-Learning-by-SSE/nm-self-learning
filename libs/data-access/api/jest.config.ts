/* eslint-disable */
export default {
	displayName: "data-access-api",
	testEnvironment: "node",
	globals: {},
	transform: {
		"^.+\\.[tj]sx?$": [
			"ts-jest",
			{
				tsconfig: "<rootDir>/tsconfig.spec.json"
			}
		]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/data-access/api",
	preset: "../../../jest.preset.js"
};
