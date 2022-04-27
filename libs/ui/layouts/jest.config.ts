module.exports = {
	displayName: "ui-layouts",

	transform: {
		"^.+\\.[tj]sx?$": "babel-jest"
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/ui/layouts",
	preset: "../../../jest.preset.ts"
};
