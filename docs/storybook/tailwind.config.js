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
			typography: theme => ({
				DEFAULT: {
					css: {
						code: {
							color: theme("colors.indigo.500")
						},
						img: {
							borderRadius: theme("borderRadius.lg")
						},
						h1: {
							fontWeight: "700",
							letterSpacing: "-0.05em",
							color: theme("colors.slate.800")
						},
						h2: {
							fontWeight: "700",
							letterSpacing: "-0.05em",
							color: theme("colors.slate.800")
						},
						h3: {
							fontWeight: "700",
							letterSpacing: "-0.05em",
							color: theme("colors.slate.800")
						}
					}
				}
			}),
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans]
			},
			colors: {
				secondary: "var(--color-secondary)",
				light: "var(--color-light)",
				"light-border": "var(--color-light-border)"
			}
		}
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
};
