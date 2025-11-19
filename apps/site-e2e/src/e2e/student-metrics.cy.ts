// npx cypress run --project=apps/site-e2e --spec "apps/site-e2e/src/e2e/student-metrics.cy.ts"

describe("App", () => {
	before(() => {
		cy.login("potter");
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

	it("Should navigate to learning analytics", () => {
		cy.visit("/learning-analytics");

		cy.get("#student-analytics-title");
	});

	it("Should contain My Learning Path Card", () => {
		cy.get("#MyLearningPathCard").should("exist");
	});

	it("Should contain Personalized Feedback Card", () => {
		cy.get("#PersonalizedFeedbackCard").should("exist");
	});

	it("Should contain Study Heatmaps Card", () => {
		cy.get("#StudyHeatmapsCard").should("exist");
	});

	it("Should contain time allocation chart", () => {
		cy.get("#TimeAllocationChart").should("exist");
	});

	it("Should open heatmap modal on clicking the heatmap card", () => {
		cy.get("#open-detailed-heatmaps").click();

		cy.get("#HeatmapModalPanel").should("exist");
	});

	it("Should have four heatmap types", () => {
		cy.get("#DayHeatmap").should("exist");
		cy.get("#WeekHeatmap").should("exist");
		cy.get("#MonthHeatmap").should("exist");
		cy.get("#YearHeatmap").should("exist");
	});
});
