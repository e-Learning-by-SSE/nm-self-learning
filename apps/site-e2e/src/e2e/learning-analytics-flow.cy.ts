// Requires: npm run seed:analytics-test

const analyticsPath = "/learning-analytics";

function openAnalyticsAs(username: string) {
	cy.login(username);
	cy.visit(analyticsPath);
}

function learningPath() {
	return cy.get("#MyLearningPathCard");
}

function expectCourseCount(completed: number, total: number) {
	learningPath().should($card => {
		const text = $card.text();
		expect(text).to.match(new RegExp(`${completed}\\s+(von|of)\\s+${total}`));
	});
}

function nextSubject() {
	learningPath()
		.find('button[aria-label="Next Subject"], button[aria-label="Nächstes Fach"]')
		.click();
}

describe("Learning analytics fixture flows", () => {
	it("shows partial lesson progress separately for each enrolled subject", () => {
		openAnalyticsAs("analytics-test-student-partial");

		learningPath().should("contain.text", "Informatik").and("contain.text", "25%");
		expectCourseCount(0, 1);

		nextSubject();
		learningPath().should("contain.text", "Mathematik").and("contain.text", "54%");
		expectCourseCount(0, 1);
	});

	it("shows completed courses only in the subjects where they were completed", () => {
		openAnalyticsAs("analytics-test-student-complete");

		learningPath().should("contain.text", "Informatik").and("contain.text", "100%");
		expectCourseCount(1, 1);

		nextSubject();
		learningPath().should("contain.text", "Mathematik").and("contain.text", "100%");
		expectCourseCount(1, 1);
	});

	it("combines courses in one subject and navigates to a different subject", () => {
		openAnalyticsAs("analytics-test-student-half");

		learningPath().should("contain.text", "Informatik").and("contain.text", "50%");
		expectCourseCount(0, 1);

		nextSubject();
		learningPath().should("contain.text", "Mathematik").and("contain.text", "50%");
		expectCourseCount(1, 2);
		learningPath().should($card => {
			expect($card.text()).to.match(/Gesamtfortschritt im Fach|Overall subject progress/);
		});
		cy.get("#course-progress-tooltip").should("not.be.visible");
		learningPath().find('button[aria-describedby="course-progress-tooltip"]').focus();
		cy.get("#course-progress-tooltip").should("be.visible");
		cy.contains("#MyLearningPathCard span", "Didaktik der Geometrie")
			.parent()
			.should("contain.text", "100%");
		cy.contains("#MyLearningPathCard span", "Analysis")
			.parent()
			.should("contain.text", "0%");
	});

	it("shows creator analytics directly for a teacher without enrollments", () => {
		openAnalyticsAs("analytics-test-teacher");

		cy.get("h1").should("contain.text", "analytics-test-teacher");
		cy.contains("Creator Analytics").should("not.exist");
		cy.contains(/Overall Average Completion Rate|Durchschnittliche Abschlussrate \(insgesamt\)/)
			.parent()
			.should("contain.text", "49.3%");
	});

	it("shows creator and learner tabs for an enrolled teacher", () => {
		openAnalyticsAs("analytics-test-teacher-enrolled");

		cy.contains('[role="tab"]', "Creator Analytics").should(
			"have.attr",
			"aria-selected",
			"true"
		);
		cy.get("h1").should("contain.text", "analytics-test-teacher-enrolled");

		cy.contains('[role="tab"]', "My Learning Analytics").click();
		cy.get("#student-analytics-title").should(
			"contain.text",
			"analytics-test-teacher-enrolled"
		);
		learningPath().should("contain.text", "Informatik");
		nextSubject();
		learningPath().should("contain.text", "Mathematik");
	});

	it("shows creator analytics for the administrator fixture", () => {
		openAnalyticsAs("analytics-test-admin");

		cy.get("h1").should("contain.text", "analytics-test-admin");
		cy.get("#student-analytics-title").should("not.exist");
	});

	it("shows deterministic learning-time, streak, heatmap, and quiz analytics", () => {
		openAnalyticsAs("analytics-test-student-activity");

		cy.get("#TimeAllocationChart")
			.should("exist")
			.and($card => {
				expect($card.text()).to.match(/55\s+(Minuten|minutes)/i);
			});

		cy.get("#PersonalizedFeedbackCard").should($card => {
			const text = $card.text();
			expect(text).to.match(/3\s+(Tage|days)/i);
			// Cypress navigation records additional EventLog activity, so the displayed
			// daily average can increase across repeated runs without reseeding.
			expect(text).to.match(/0\s+(Stunden|hours).*?\d+\s+(Minuten|minutes)/i);
			expect(text).to.match(/Nachmittag|afternoon/i);
		});

		cy.get("#StudyHeatmapsCard").should("exist");

		cy.contains(/Mehr Feedbacks anzeigen|Show more feedback/i).click();
		cy.get('[role="dialog"]').should($dialog => {
			const text = $dialog.text();
			expect(text).to.match(/4\s+(Quizfragen|quiz questions)/i);
			expect(text).to.match(/75%/);
		});
	});
});
