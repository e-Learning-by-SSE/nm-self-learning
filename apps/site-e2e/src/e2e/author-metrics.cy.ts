// npx cypress run --project=apps/site-e2e --spec "apps/site-e2e/src/e2e/author-metrics.cy.ts"

describe("App", () => {
	before(() => {
		cy.login("dumbledore");
	});

	beforeEach(() => {
		// Some e2e tests open the app for the first time and have to accept the data privacy banner
		// Click "Speichern" only if that button/dialog is present
		it("Accepts data privacy banner if present", () => {
			cy.get("body").then($body => {
				if ($body.find("button:contains('Speichern')").length > 0) {
					cy.contains("button", "Speichern").click();
				} else {
					cy.log("No privacy banner present — continuing");
				}
			});
		});
	});

	it("Should navigate to author analytics", () => {
		cy.visit("/learning-analytics");
		cy.get("#author-analytics-title");
	});

	it("Should contain course completion rate", () => {
		// h2 with Completion Rate - ...
		cy.get("h2:contains('Completion Rate')").should("exist");
	});

	it("Should contain average completion rate", () => {
		cy.get("h2:contains('Average Completion Rate')").should("exist");
	});

	it("Should contain Analysis", () => {
		cy.get("#AnalysisCard").should("exist");
	});

	it("Should contain Overview", () => {
		cy.get("#OverviewCard").should("exist");
	});
});
