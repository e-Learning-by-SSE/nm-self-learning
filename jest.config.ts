const { getJestProjects } = require("@nx/jest");

export default {
	projects: getJestProjects(),
	coverageReporters: ["cobertura", "text", "html"]
};
