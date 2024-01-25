/* eslint-disable */
export default {
	displayName: "learning-analytics",
	preset: "../../../jest.preset.js",
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
	coverageDirectory: "../../../coverage/libs/feature/learning-analytics"
};
