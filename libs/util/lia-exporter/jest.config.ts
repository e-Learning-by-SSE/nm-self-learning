/* eslint-disable */
export default {
	displayName: "lia-exporter",
	preset: "../../../jest.preset.js",
	testEnvironment: "node",
	transform: {
		"^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "html"],
	coverageDirectory: "../../../coverage/libs/util/lia-exporter",
	/*
	 * Avoids SyntaxError: Unexpected token export which is produced by LiaScript Library
	 * See: https://stackoverflow.com/a/49676319
	 */
	transformIgnorePatterns: ["node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)"]
};
