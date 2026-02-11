/* eslint-disable */
const nxPreset = require("@nx/jest/preset").default;

const path = require("path");

const projectRoot = path.resolve(__dirname, "./");
process.env.TZ = "Europe/Berlin";

const project = process.env.NX_TASK_TARGET_PROJECT || "unknown";
const taskHash = process.env.NX_TASK_HASH || process.pid;

const workspaceRoot = process.cwd();

module.exports = {
	...nxPreset,
	setupFiles: ["dotenv/config"],
	globals: {},
	/* TODO: Update to latest Jest snapshotFormat
	 * By default Nx has kept the older style of Jest Snapshot formats
	 * to prevent breaking of any existing tests with snapshots.
	 * It's recommend you update to the latest format.
	 * You can do this by removing snapshotFormat property
	 * and running tests with --update-snapshot flag.
	 * Example: "nx affected --targets=test --update-snapshot"
	 * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
	 */
	snapshotFormat: { escapeString: true, printBasicPrototype: true },
	collectCoverageFrom: [
		"<rootDir>/src/**/*.{js,jsx,ts,tsx}",
		"!<rootDir>/**/?(*.)+(spec|test).{js,jsx,ts,tsx}",
		"!<rootDir>/**/jest.config.*",
		"!<rootDir>/**/jest.setup.*"
	],
	coverageProvider: "v8",
	coverageDirectory: path.join(workspaceRoot, "coverage", project),
	coverageReporters: ["cobertura"],
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputName: `junit-${project}-${taskHash}-${Date.now()}.xml`, // Uses timestamp to avoid overwriting test results from parallel test runs
				outputDirectory: "output/test",
				ancestorSeparator: " › ",
				suiteName: project,
				usePathForSuiteName: false,
				classNameTemplate: `${project}.{classname}`,
				titleTemplate: "{title}"
			}
		]
	],
	transform: {
		"^.+\\.[tj]sx?$": [
			"@swc/jest",
			{
				jsc: {
					parser: { syntax: "typescript", tsx: true },
					transform: { react: { runtime: "automatic" } }
				}
			}
		],
		// "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
		"^.+\\.svg$": path.join(projectRoot, "jest.svgTransform.js")
	},
	transformIgnorePatterns: [],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	extensionsToTreatAsEsm: [".ts", ".tsx"]
};
