/* eslint-disable */
export default {
	displayName: "ui-layouts",

	transform: {
		"^.+\\.[tj]sx?$": ["babel-jest", { presets: ["@nx/react/babel"] }]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/ui/layouts",
	preset: "../../../jest.preset.js"
};
