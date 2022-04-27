module.exports = {
	displayName: "site",

	transform: {
		"^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nrwl/react/plugins/jest",
		"^.+\\.[tj]sx?$": ["babel-jest", { presets: ["@nrwl/next/babel"] }]
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	coverageDirectory: "../../coverage/apps/site",
	preset: "../../jest.preset.ts"
};
