const { createGlobPatternsForDependencies } = require("@nrwl/react/tailwind");
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
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans]
			},
			colors: {
				secondary: "var(--color-secondary)",
				light: "var(--color-light)",
				"light-border": "var(--color-light-border)"
			},
			animation: {
				blob: "blob 7s infinite"
			},
			keyframes: {
				blob: {
					"0%": {
						transform: "translate(0px, 0px) scale(1)"
					},
					"25%": {
						transform: "translate(-128px, -128px) scale(1.1)"
					},
					"50%": {
						transform: "translate(0px, 256px) scale(0.9)"
					},
					"75%": {
						transform: "translate(128px, 128px) scale(0.9)"
					},
					"100%": {
						transform: "tranlate(0px, 0px) scale(1)"
					}
				}
			}
		}
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
};
