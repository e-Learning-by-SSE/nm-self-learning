const { pathsToModuleNameMapper } = require("ts-jest");
const path = require("path");
const ts = require("typescript");

const tsConfigPath = path.join(__dirname, "../../tsconfig.base.json");
const { config } = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
const { compilerOptions } = config;

// SE: Minio is not tested, but configuration read from environment during test
process.env.MINIO_ENDPOINT = "localhost";
process.env.MINIO_PORT = "9000";
process.env.MINIO_ACCESS_KEY = "test-access-key";
process.env.MINIO_SECRET_KEY = "test-secret-key";
process.env.MINIO_BUCKET_NAME = "test-bucket";

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
