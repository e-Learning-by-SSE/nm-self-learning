const { createGlobPatternsForDependencies } = require("@nrwl/react/tailwind");
const { join } = require("path");

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	content: [
		join(__dirname, "**/!(*.stories|*.spec).tsx"),
		join(__dirname, "./pages/styles.css"),
		...createGlobPatternsForDependencies(__dirname)
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans]
			}
		}
	},
	plugins: [require("@tailwindcss/typography")]
};
