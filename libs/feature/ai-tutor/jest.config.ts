/* eslint-disable */
const { join } = require("path");

module.exports = {
	displayName: "feature-ai-tutor",
	preset: "../../../jest.preset.js",

	setupFiles: [join(__dirname, "jest.setup.js")],

	coverageDirectory: "../../../coverage/libs/feature/ai-tutor"
};
