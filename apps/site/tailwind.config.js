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
				},
				highlight: {
					"0%, 100%": { backgroundColor: "transparent" },
					"50%": { backgroundColor: "grey" }
				},
				shine: {
					"0%": {
						backgroundPosition: "200% center",
						opacity: "0.5"
					},
					"100%": {
						backgroundPosition: "-200% center",
						opacity: "1"
					}
				},
				"diamond-shine": {
					"0%": {
						transform: "translateX(-100%)",
						opacity: "0"
					},
					"20%, 80%": {
						opacity: "0.5"
					},
					"100%": {
						transform: "translateX(100%)",
						opacity: "0"
					}
				},
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
						transform: "translate(0px, 0px) scale(1)"
					}
				}
			},
			animation: {
				blob: "blob 7s infinite",
				fadeIn: "fadeIn 1s ease-in-out",
				shine: "shine 1.5s ease-in-out",
				highlight: "highlight 1s ease-in-out",
				"color-change": "color-change 6s ease forwards",
				"shine-continuous": "shine 2s infinite linear",
				"diamond-shine": "diamond-shine 2s ease-in",
				"diamond-shine-continuous": "diamond-shine 1s infinite"
			},
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans]
			},
			colors: {
				secondary: "var(--color-secondary)",
				light: "var(--color-light)",
				"light-border": "var(--color-light-border)",

				/* Surface */
				"c-surface-base": "var(--c-surface-base)",
				"c-surface-1": "var(--c-surface-1)",
				"c-surface-2": "var(--c-surface-2)",
				"c-surface-3": "var(--c-surface-3)",

				/* Text */
				"c-text-strong": "var(--c-text-strong)",
				"c-text-base": "var(--c-text-base)",
				"c-text-muted": "var(--c-text-muted)",
				"c-text-inverted": "var(--c-text-inverted)",

				/* Borders */
				"c-border": "var(--c-border)",
				"c-border-strong": "var(--c-border-strong)",
				"c-border-muted": "var(--c-border-muted)",

				/* Primary */
				"c-primary": "var(--c-primary)",
				"c-primary-strong": "var(--c-primary-strong)",
				"c-primary-muted": "var(--c-primary-muted)",

				/* Accent */
				"c-accent": "var(--c-accent)",
				"c-accent-strong": "var(--c-accent-strong)",
				"c-accent-muted": "var(--c-accent-muted)",

				/* Danger */
				"c-danger": "var(--c-danger)",
				"c-danger-strong": "var(--c-danger-strong)",
				"c-danger-muted": "var(--c-danger-muted)",

				/* Info */
				"c-info": "var(--c-info)",
				"c-info-strong": "var(--c-info-strong)",
				"c-info-muted": "var(--c-info-muted)",

				/* Hover */
				"c-hover": "var(--c-hover)"
			},
			backgroundSize: {
				"300%": "300% 300%"
			}
		}
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
};
