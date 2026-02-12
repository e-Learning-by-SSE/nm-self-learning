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
	moduleNameMapper: {
		...pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
			prefix: "<rootDir>/../../"
		}),
		"^@xenova/transformers$": "<rootDir>/src/__mocks__/@xenova/transformers.ts"
	},

	// Setup global setup to use NX way to run tests in VS Code
	// This will build the worker-service before running tests
	globalSetup: "<rootDir>/jest.global-setup.ts",

	// Close open handles (e.g., Worker threads) after tests
	detectOpenHandles: true,
	forceExit: true,
	transformIgnorePatterns: ["node_modules/(?!(@xenova/transformers|sharp|onnxruntime-node)/)"]
};
