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
    viewportHeight: 1080,
    viewportWidth: 1600,
    specPattern: "src/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "src/support/e2e.ts",
    scrollBehavior: "center",
    experimentalSessionAndOrigin: true,
    /**
    * TODO(@nrwl/cypress): In Cypress v12,the testIsolation option is turned on by default. 
    * This can cause tests to start breaking where not indended.
    * You should consider enabling this once you verify tests do not depend on each other
    * More Info: https://docs.cypress.io/guides/references/migration-guide#Test-Isolation
    **/
    testIsolation: false,
 }
});
