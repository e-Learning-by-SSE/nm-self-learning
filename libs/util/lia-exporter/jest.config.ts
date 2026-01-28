export default {
	displayName: "lia-exporter",
	preset: "../../../jest.preset.js",
	testEnvironment: "node",
	coverageDirectory: "../../../coverage/libs/util/lia-exporter",
	/*
	 * Avoids SyntaxError: Unexpected token export which is produced by LiaScript Library
	 * See: https://stackoverflow.com/a/49676319
	 */
	transformIgnorePatterns: ["node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)"]
};
