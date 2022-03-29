const { createGlobPatternsForDependencies } = require("@nrwl/next/tailwind");
const { join } = require("path");

module.exports = {
	presets: [require("../../apps/site/tailwind.config")],
	content: [
		join(__dirname, "src/**/*.{tsx,mdx}"),
		...createGlobPatternsForDependencies(__dirname)
	]
};
