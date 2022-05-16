export default {
	displayName: "ui-common",

	transform: {
		"^.+\\.[tj]sx?$": "babel-jest"
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/ui/common",
	preset: "../../../jest.preset.js"
};
