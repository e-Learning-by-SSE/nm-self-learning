import baseConfig from "../../../eslint.config.mjs";
import nx from "@nx/eslint-plugin";
import nextTs from "eslint-config-next/typescript";

const config = [
	{
		ignores: ["**/dist"]
	},
	...baseConfig,
	...nextTs,
	...nx.configs["flat/react"],
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
