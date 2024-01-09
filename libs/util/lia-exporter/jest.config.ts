/* eslint-disable */
export default {
	displayName: "lia-exporter",
	preset: "../../../jest.preset.js",
	testEnvironment: "node",
	transform: {
		"^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }]
	},
	moduleFileExtensions: ["ts", "js", "html"],
	coverageDirectory: "../../../coverage/libs/util/lia-exporter"
};
