const nxPreset = require("@nx/jest/preset").default;

const path = require("path");
const { workspaceRoot } = require("nx/src/utils/workspace-root");

const projectRoot = path.resolve(__dirname, "./");
process.env.TZ = "Europe/Berlin";

module.exports = {
	...nxPreset,
	setupFiles: ["dotenv/config"],
	setupFilesAfterEnv: [path.join(workspaceRoot, "jest.setup.ts")],
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
		"src/**/*.{js,jsx,ts,tsx}",
		"libs/**/*.{js,jsx,ts,tsx}",
		"!<rootDir>/node_modules/"
	],
	coverageReporters: ["cobertura", "text", "html"],
	coverageDirectory: "output/test/coverage",
	reporters: [
		"default",
		[
			"jest-junit",
			{
				outputName: `junit-${new Date().getTime()}.xml`, // Setzt einen Zeitstempel, um Überschreiben zu vermeiden
				outputDirectory: "output/test",
				suiteName: "Test Suite",
				classNameTemplate: "{classname}",
				titleTemplate: "{title}",
				ancestorSeparator: " › ",
				usePathForSuiteName: "true"
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
		"^.+\\.svg$": path.join(projectRoot, "jest.svgTransform.js")
	},
	transformIgnorePatterns: [],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	extensionsToTreatAsEsm: [".ts", ".tsx"]
};
