/* eslint-disable */
export default {
	displayName: "feature-ai-tutor",
	preset: "../../../jest.preset.js",
	transform: {
		"^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nx/react/plugins/jest",
		"^.+\\.[tj]sx?$": [
			"babel-jest",
			{ presets: ["@nx/react/babel"], configFile: "./libs/feature/ai-tutor/.babelrc" }
		]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/feature/ai-tutor"
};
