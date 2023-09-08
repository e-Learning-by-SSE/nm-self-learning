/* eslint-disable */
export default {
	displayName: "feature-learning-diary",
	preset: "../../../jest.preset.js",
	transform: {
		"^.+\\.[tj]sx?$": ["@swc/jest", { jsc: { transform: { react: { runtime: "automatic" } } } }]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../../coverage/libs/feature/learning-diary"
};
