// npx cypress run --project=apps/site-e2e --spec "apps/site-e2e/src/e2e/student-metrics.cy.ts"

describe("App", () => {
	before(() => {
		cy.login("potter");
		cy.visit("/learning-analytics");
	});

	it("Should navigate to learning analytics", () => {
		cy.get("h1").should(
			"contain",
			"Willkommen zurück, potter! Schau dir deinen Lernfortschritt an."
		);
	});

	it("Should contain Study Heatmaps Card", () => {
		cy.get("#StudyHeatmapsCard").should("exist");

		cy.get("#StudyHeatmapsCard h2").should("contain", "Study Heatmaps");

		cy.get('#StudyHeatmapsCard [title="Select Heatmap Type"]').should("exist");

		cy.get("#StudyHeatmapsCard").contains("Click to open detailed heatmaps").should("exist");
	});

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

	it("Should open heatmap modal on clicking the heatmap card", () => {
		cy.get("#StudyHeatmapsCard").contains("Click to open detailed heatmaps").click();

		cy.get("#HeatmapModal").should("be.visible");

		cy.contains("button", "Choose...").should("exist");
	});

	it("Should select heatmap type hours from dropdown", () => {
		cy.get("#HeatmapTypeButton").click();

		cy.get("#HeatmapTypeOption").contains("Hours").click();

		cy.get("#HeatmapTypeButton").should("contain", "Hours");

		cy.get("#HeatmapTypeButtonClose").click();
	});

	it("Should select heatmap type units from dropdown", () => {
		cy.contains("#HeatmapTypeOption", "Units", { timeout: 1000 }).click();

		cy.get("#HeatmapTypeButton").should("contain", "Units");

		cy.get("#HeatmapTypeButtonClose").click();
	});

	it("Should select heatmap type accuracy from dropdown", () => {
		cy.contains("#HeatmapTypeOption", "Accuracy", { timeout: 1000 }).click();

		cy.get("#HeatmapTypeButton").should("contain", "Accuracy");

		cy.get("#HeatmapTypeButtonClose").click();
	});

	it("Should close heatmap modal on clicking outside the modal", () => {
		// click outside the modal to close it
		cy.get("#HeatmapModal").click("topLeft");

		cy.contains("#HeatmapModalCloseButton", "Close", { timeout: 1000 }).should("exist").click();

		cy.get("#HeatmapModal").should("not.exist");
	});
});
