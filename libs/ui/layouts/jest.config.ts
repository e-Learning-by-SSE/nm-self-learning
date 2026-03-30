export default {
	testEnvironmentOptions: {
		url: "https://example.com" // -> window.location.origin === "https://example.com"
	},
	displayName: "ui-layouts",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	coverageDirectory: "../../../coverage/libs/ui/layouts",
	preset: "../../../jest.preset.js"
};
