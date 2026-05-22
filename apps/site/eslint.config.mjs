import baseConfig from "../../eslint.config.mjs";
import globals from "globals";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
	{
		ignores: ["**/dist"]
	},
	...baseConfig,
	...nextTs,
	...nextVitals,
	{ languageOptions: { globals: { ...globals.jest } } },
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		// Override or add rules here
		rules: {}
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
export default config;
