/* eslint-disable @typescript-eslint/no-require-imports */
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

				/* Neutral */
				"c-neutral-0": "var(--c-neutral-0)",
				"c-neutral-50": "var(--c-neutral-50)",
				"c-neutral-100": "var(--c-neutral-100)",
				"c-neutral-200": "var(--c-neutral-200)",
				"c-neutral-300": "var(--c-neutral-300)",
				"c-neutral-400": "var(--c-neutral-400)",
				"c-neutral-500": "var(--c-neutral-500)",
				"c-neutral-600": "var(--c-neutral-600)",
				"c-neutral-700": "var(--c-neutral-700)",
				"c-neutral-800": "var(--c-neutral-800)",
				"c-neutral-900": "var(--c-neutral-900)",

				/* Surface */
				"c-surface-0": "var(--c-surface-0)",
				"c-surface-1": "var(--c-surface-1)",
				"c-surface-2": "var(--c-surface-2)",
				"c-surface-3": "var(--c-surface-3)",

				/* Text */
				"c-text-strong": "var(--c-text-strong)",
				"c-text": "var(--c-text)",
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
				"c-primary-subtle": "var(--c-primary-subtle)",

				/* Accent */
				"c-accent": "var(--c-accent)",
				"c-accent-strong": "var(--c-accent-strong)",
				"c-accent-muted": "var(--c-accent-muted)",

				/* Danger */
				"c-danger": "var(--c-danger)",
				"c-danger-strong": "var(--c-danger-strong)",
				"c-danger-muted": "var(--c-danger-muted)",
				"c-danger-subtle": "var(--c-danger-subtle)",

				/* Semantic Colors */
				"c-neutral": "var(--c-neutral)",
				"c-neutral-strong": "var(--c-neutral-strong)",
				"c-neutral-muted": "var(--c-neutral-muted)",
				"c-neutral-subtle": "var(--c-neutral-subtle)",

				"c-success": "var(--c-success)",
				"c-success-strong": "var(--c-success-strong)",
				"c-success-muted": "var(--c-success-muted)",
				"c-success-subtle": "var(--c-success-subtle)",

				"c-error": "var(--c-error)",
				"c-error-strong": "var(--c-error-strong)",
				"c-error-muted": "var(--c-error-muted)",
				"c-error-subtle": "var(--c-error-subtle)",

				"c-info": "var(--c-info)",
				"c-info-strong": "var(--c-info-strong)",
				"c-info-muted": "var(--c-info-muted)",
				"c-info-subtle": "var(--c-info-subtle)",

				"c-attention": "var(--c-attention)",
				"c-attention-strong": "var(--c-attention-strong)",
				"c-attention-muted": "var(--c-attention-muted)",
				"c-attention-subtle": "var(--c-attention-subtle)"
			},
			backgroundSize: {
				"300%": "300% 300%"
			}
		}
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")]
};
