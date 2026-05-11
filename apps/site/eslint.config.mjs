import baseConfig from "../../eslint.config.mjs";
import globals from "globals";

export default [
	{
		ignores: ["**/dist"]
	},
	...baseConfig,
	{ languageOptions: { globals: { ...globals.jest } } },
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		rules: {
			"@next/next/no-html-link-for-pages": ["error", "apps/site/pages"]
		}
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		rules: {}
	},
	{
		files: ["**/*.js", "**/*.jsx"],
		rules: {}
	}
];
