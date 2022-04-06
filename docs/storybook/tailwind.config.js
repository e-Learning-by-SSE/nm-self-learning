const { join } = require("path");

const defaultTheme = require("tailwindcss/defaultTheme");

console.log("Using docs/storybook/tailwind.config.js");

module.exports = {
	content: [
		join(__dirname, "./src/lib/**/*.{tsx,mdx}"),
		join(__dirname, "../../libs/ui/**/*.{tsx,mdx}"),
		join(__dirname, "../../apps/site/pages/styles.css")
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans]
			}
		}
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
};
