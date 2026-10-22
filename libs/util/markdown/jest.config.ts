/* eslint-disable */
const path = require("path");
const preset = require("../../../jest.preset.js");

module.exports = {
	displayName: "util-markdown",
	preset: "../../../jest.preset.js",
	testEnvironment: "jsdom",
	moduleNameMapper: {
		...preset.moduleNameMapper,
		// Nx otherwise resolves this ESM-only MDX dependency to its declaration file.
		"^estree-walker$": path.join(
			path.dirname(
				require.resolve("estree-walker/package.json", {
					paths: [path.dirname(require.resolve("estree-util-build-jsx"))]
				})
			),
			"src/index.js"
		)
	}
};
