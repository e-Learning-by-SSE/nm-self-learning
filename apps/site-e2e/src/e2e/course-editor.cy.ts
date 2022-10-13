import { runCommand } from "../support/util";

describe("/teaching/lessons/edit - Lesson Editor", () => {
	beforeEach(() => {
		cy.login();
		runCommand({
			command: "upsertCourse",
			payload: {
				create: {
					courseId: "test-course",
					slug: "test-course",
					title: "Test Course",
					subtitle: "Test Course Subtitle",
					description: "Test Course Description",
					content: [],
					authors: {
						connect: [{ slug: "albus-dumbledore" }]
					}
				},
				update: {
					courseId: "test-course",
					slug: "test-course",
					title: "Test Course",
					subtitle: "Test Course Subtitle",
					description: "Test Course Description",
					content: [],
					authors: {
						set: [{ slug: "albus-dumbledore" }]
					}
				}
			}
		});
		cy.visit("/teaching/courses/edit/test-course");
	});

	it("Opens Course Editor", () => {
		cy.get("h1").should("contain", "Test Course").should("be.visible");
	});

	it("Update title", () => {
		cy.get("h1").should("contain", "Test Course").should("be.visible");
		cy.get("input[name=title]").clear().type("Updated Course");
		cy.get("button[type=submit]").first().click();
		cy.byTestId("toast-success").should("be.visible");
		cy.get("h1").should("contain", "Updated Course");
	});

	it("Remove author", () => {
		cy.byTestId("author").should("have.length", 1);
		cy.on("window:confirm", cy.stub().returns(true));

		cy.byTestId("author-remove").click();

		// Before saving: author is removed
		cy.byTestId("author").should("have.length", 0);

		cy.get("button[type=submit]").first().click();

		// After saving: author is still removed
		cy.byTestId("author").should("have.length", 0);
		cy.byTestId("toast-success").should("be.visible");
	});

	it("Add author", () => {
		cy.byTestId("author").should("have.length", 1);

		cy.byTestId("author-add").click();
		cy.get("input[type=text]").type("mcgonagall");
		cy.byTestId("author-option").click();

		// Before saving: author is added
		cy.byTestId("author").should("have.length", 2);

		cy.get("button[type=submit]").first().click();

		// After saving: author is still added
		cy.byTestId("author").should("have.length", 2);
	});
});
