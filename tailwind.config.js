const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");

const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("tailwindcss").Config}  */
module.exports = {
	content: [
		join(__dirname, "./**/!(*.stories|*.spec).tsx"),
		join(__dirname, "./pages/styles.css"),
		...createGlobPatternsForDependencies(__dirname, "/**/!(*.stories|*.spec).tsx")
	],
	theme: {
		extend: {
			typography: theme => ({
				DEFAULT: {
					css: {
						code: {
							color: theme("colors.emerald.500")
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
			keyframes: {
				fadeIn: {
					from: { opacity: "0" },
					to: { opacity: "1" }
				}
			},
			animation: {
				fadeIn: "fadeIn 1s ease-in-out"
			},
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
