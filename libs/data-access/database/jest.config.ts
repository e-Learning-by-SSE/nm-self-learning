import type { Config } from "jest";

const config: Config = {
	displayName: "database",
	coverageDirectory: "../../coverage/libs/database",
	setupFiles: ["<rootDir>/jest.setup.ts"],
	preset: "../../../jest.preset.js",

	transform: {
		"^.+\\.[cm]?[jt]sx?$": [
			"@swc/jest",
			{
				jsc: {
					target: "es2022",
					parser: {
						syntax: "typescript",
						tsx: true
					}
				},
				module: {
					type: "commonjs"
				}
			}
		]
	},

	transformIgnorePatterns: [
		"/node_modules/(?!@prisma/client/runtime/query_compiler_fast_bg\\.postgresql\\.(?:wasm-base64\\.)?mjs$)"
	]
};

export default config;
