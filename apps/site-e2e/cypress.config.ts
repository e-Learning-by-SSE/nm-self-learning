import { defineConfig } from "cypress";
import { nxE2EPreset } from "@nrwl/cypress/plugins/cypress-preset";

const cypressJsonConfig = {
	fileServerFolder: ".",
	fixturesFolder: "./src/fixtures",
	video: true,
	videosFolder: "../../dist/cypress/apps/site-e2e/videos",
	screenshotsFolder: "../../dist/cypress/apps/site-e2e/screenshots",
	chromeWebSecurity: false,
	baseUrl: "http://localhost:4200",
	defaultCommandTimeout: 2000,
	viewportHeight: 1050,
	viewportWidth: 1400,
	specPattern: "src/e2e/**/*.cy.{js,jsx,ts,tsx}",
	supportFile: "src/support/e2e.ts"
};
export default defineConfig({
	e2e: {
		...nxE2EPreset(__filename),
		...cypressJsonConfig
	},

	component: {
		devServer: {
			framework: "next",
			bundler: "webpack"
		}
	}
});
