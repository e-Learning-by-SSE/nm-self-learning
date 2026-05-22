const { pathsToModuleNameMapper } = require("ts-jest");
const path = require("path");
const ts = require("typescript");

const tsConfigPath = path.join(__dirname, "../../tsconfig.base.json");
const { config } = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
const { compilerOptions } = config;

/* eslint-disable */
module.exports = {
	displayName: "worker-service",
	testEnvironment: "node",
	coverageDirectory: "../../coverage/apps/worker-service",
	preset: "../../jest.preset.js",

	// Setup global setup to use NX way to run tests in VS Code
	// This will build the worker-service before running tests
	globalSetup: "<rootDir>/jest.global-setup.ts",

	// Close open handles (e.g., Worker threads) after tests
	detectOpenHandles: true,
	forceExit: true
};
