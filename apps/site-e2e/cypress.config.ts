import { defineConfig } from "cypress";
import { nxE2EPreset } from "@nrwl/cypress/plugins/cypress-preset";

export default defineConfig({
	e2e: {
		...nxE2EPreset(__dirname),
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
		supportFile: "src/support/e2e.ts",
		scrollBehavior: "center", // does not fix screenshots :(
		experimentalSessionAndOrigin: true // avoids having to login for each test
	}
});
