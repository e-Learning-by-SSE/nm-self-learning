const nxPreset = require("@nx/jest/preset").default;

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
		"src/**/*.{js,jsx,ts,tsx}",
		"libs/**/*.{js,jsx,ts,tsx}",
		"!<rootDir>/node_modules/"
	],
	coverageReporters: ["cobertura", "text", "html"],
	coverageDirectory: "output/test/coverage",
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "output/test", outputName: "junit.xml" }]
	]
};
