import { Prisma } from "@prisma/client";
import { runCommand } from "../support/util";

describe("/teaching/lessons/edit - Lesson Editor", () => {
	beforeEach(() => {
		cy.login();

		runCommand("upsertLesson", {
			title: "Test Lesson",
			content: [],
			lessonId: "test-lesson",
			slug: "test-lesson",
			meta: Prisma.JsonNull
		});
		cy.visit("/teaching/lessons/edit/test-lesson");
	});

	it("Opens Lesson Editor", () => {
		cy.get("h1").should("contain", "Test Lesson");
	});

	it("Update Title -> Save -> Title is updated", () => {
		cy.get("input[name=title]").clear({ force: true }).type("Updated Title");
		cy.get("button[type=submit]").first().click({ force: true });
		cy.get("h1").should("contain", "Updated Title");
	});
});
