const { createGlobPatternsForDependencies } = require("@nrwl/react/tailwind");
const { join } = require("path");

module.exports = {
	content: [
		join(__dirname, "**/!(*.stories|*.spec).tsx"),
		...createGlobPatternsForDependencies(__dirname)
	],
	theme: {
		extend: {}
	},
	plugins: []
};
