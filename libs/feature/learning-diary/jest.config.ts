/* eslint-disable */
export default {
	displayName: "feature-learning-diary",
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
	coverageDirectory: "../../../coverage/libs/feature/learning-diary"
};
