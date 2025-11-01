import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import nxEslintPlugin from "@nx/eslint-plugin";
import pluginCypress from "eslint-plugin-cypress";

const compat = new FlatCompat({
	baseDirectory: dirname(fileURLToPath(import.meta.url)),
	recommendedConfig: js.configs.recommended
});

export default [
	{
		ignores: ["**/dist", "node_modules/**", "apps/site/.next/**"]
	},
	{ plugins: { "@nx": nxEslintPlugin } },
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
	},
	...compat
		.config({
			extends: ["plugin:@nx/typescript"]
		})
		.map(config => ({
			...config,
			files: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts"],
			rules: {
				...config.rules,
				indent: [
					"off",
					"tab",
					{
						SwitchCase: 1
					}
				],
				semi: "off",
				"no-empty": "off",
				"no-empty-function": "off",
				"@typescript-eslint/no-empty-function": "off",
				"jsx-a11y/anchor-is-valid": ["off"],
				"no-unused-vars": "off",
				"@typescript-eslint/no-unused-vars": [
					"warn",
					{
						argsIgnorePattern: "^_",
						varsIgnorePattern: "^_",
						caughtErrorsIgnorePattern: "^_"
					}
				],
				"no-extra-semi": "error",
				"@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }]
			}
		})),
	...compat
		.config({
			extends: ["plugin:@nx/javascript"]
		})
		.map(config => ({
			...config,
			files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
			rules: {
				...config.rules,
				"no-extra-semi": "error"
			}
		})),
	// 5) Cypress E2E — flat-safe manual block (avoids legacy preset entirely)
	{
		files: ["apps/site-e2e/**/*.{cy,spec}.{ts,tsx,js,jsx}"],
		plugins: { cypress: pluginCypress },
		languageOptions: {
			globals: {
				cy: true,
				Cypress: true,
				expect: true,
				assert: true
			}
		},
		rules: {
			// add what you need from the recommended set:
			"cypress/no-async-tests": "error",
			"cypress/no-force": "warn",
			"cypress/assertion-before-screenshot": "warn"
			// ...add more cypress/* rules your team wants
		}
	},
	{
		ignores: ["apps/site/.next"]
	}
];
