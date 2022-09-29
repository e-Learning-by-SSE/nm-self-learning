/* eslint-disable */
export default {
	displayName: "ui-common",

	transform: {
		"^.+\\.[tj]sx?$": ['babel-jest', { presets: ['@nrwl/react/babel'] }]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/ui/common",
	preset: "../../../jest.preset.js"
};
