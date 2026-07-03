const { join } = require("path");

/* eslint-disable */
module.exports = {
	displayName: "feature-ai-tutor",
	preset: "../../../jest.preset.js",
	transform: {
		"^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nx/react/plugins/jest",
		"^.+\\.[tj]sx?$": [
			"babel-jest",
			{ presets: ["@nx/react/babel"], configFile: join(__dirname, ".babelrc") }
		]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/feature/ai-tutor"
};
