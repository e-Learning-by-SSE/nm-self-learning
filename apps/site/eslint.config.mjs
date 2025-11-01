import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import baseConfig from "../../eslint.config.mjs";
import globals from "globals";

const compat = new FlatCompat({
	baseDirectory: dirname(fileURLToPath(import.meta.url)),
	recommendedConfig: js.configs.recommended
});

export default [
	{
		ignores: ["**/dist"]
	},
	...baseConfig,
	...compat.extends("plugin:@nx/react-typescript", "next", "next/core-web-vitals"),
	{ languageOptions: { globals: { ...globals.jest } } },
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		rules: {
			"@next/next/no-html-link-for-pages": ["error", "apps/site/pages"]
		}
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		// Override or add rules here
		rules: {}
	},
	{
		files: ["**/*.js", "**/*.jsx"],
		// Override or add rules here
		rules: {}
	}
];
