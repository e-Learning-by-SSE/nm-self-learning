import { pathsToModuleNameMapper } from "ts-jest";
import * as path from "path";
import * as ts from "typescript";

const tsConfigPath = path.join(__dirname, "../../tsconfig.base.json");
const { config } = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
const { compilerOptions } = config;

/* eslint-disable */
export default {
	displayName: "worker-service",
	testEnvironment: "node",
	coverageDirectory: "../../coverage/apps/worker-service",
	preset: "../../jest.preset.js",

	// for Jest (transform imports)
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
		prefix: "<rootDir>/../../"
	}),

	// for ts-node at runtime (Worker/Jobs)
	setupFiles: ["<rootDir>/jest.setup.ts"]
};
