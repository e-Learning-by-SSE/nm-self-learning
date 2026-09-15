/* eslint-disable */
import type { Config } from "jest";
import { fileURLToPath } from "node:url";

process.env.I18NEXT_DEFAULT_CONFIG_PATH = fileURLToPath(
	new URL("./next-i18next.config.js", import.meta.url)
);

const config: Config = {
	displayName: "site",
	coverageDirectory: "../../coverage/apps/site",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	preset: "../../jest.preset.js"
};

export default config;
