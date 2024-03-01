/* eslint-disable */
export default {
	displayName: "ui-lesson",

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
	coverageDirectory: "../../../coverage/libs/ui/lesson",
	preset: "../../../jest.preset.js"
};
