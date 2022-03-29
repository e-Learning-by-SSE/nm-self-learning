module.exports = {
	displayName: "docs-storybook",
	preset: "../../../jest.preset.js",
	transform: {
		"^.+\\.[tj]sx?$": "babel-jest"
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/docs/storybook"
};
