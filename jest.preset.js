const nxPreset = require("@nrwl/jest/preset").default;

module.exports = {
	...nxPreset,
	setupFiles: ["dotenv/config"],
	globals: {
		"ts-jest": {
			isolatedModules: true
		}
	}
};
