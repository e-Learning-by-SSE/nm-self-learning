import { QuizContent } from "@self-learning/question-types";
import { createChapter, createCourseContent, createLesson } from "@self-learning/types";
import { createExampleCourse, createExampleLesson } from "@self-learning/util/testing";
import { runCommand } from "../support/util";

const testId = "quiz-cy";

const courseContent = createCourseContent([
	createChapter("Chapter 1", [
		createLesson(`${testId}-lesson-single`),
		createLesson(`${testId}-lesson-multiple`),
		createLesson(`${testId}-lesson-no-quiz`)
	])
]);

const course = createExampleCourse("quiz-course", courseContent);

const lessonSingle = createExampleLesson(courseContent[0].content[0].lessonId, {
	quiz: [
		{
			type: "multiple-choice",
			questionId: "a",
			statement: "# What is 1+1?",
			answers: [
				{ answerId: "a", content: "2", isCorrect: true },
				{ answerId: "b", content: "1", isCorrect: false },
				{ answerId: "c", content: "0", isCorrect: false }
			]
		}
	] as QuizContent
});

const lessonMultiple = createExampleLesson(courseContent[0].content[1].lessonId, {
	quiz: [
		{
			type: "multiple-choice",
			questionId: "a",
			statement: "# What is 1+1?",
			answers: [
				{ answerId: "a", content: "2", isCorrect: true },
				{ answerId: "b", content: "1", isCorrect: false },
				{ answerId: "c", content: "0", isCorrect: false }
			]
		},
		{
			type: "short-text",
			questionId: "b",
			statement: "# What is 1+1?",
			acceptedAnswers: [{ acceptedAnswerId: "a", value: "2" }]
		}
	] as QuizContent
});

const lessonNoQuiz = createExampleLesson(courseContent[0].content[2].lessonId, {
	quiz: []
});

before(() => {
	runCommand("upsertCourse", {
		create: course,
		update: {}, // Can be empty, since we do not modify the course here
		lessons: {
			data: [lessonSingle, lessonMultiple, lessonNoQuiz],
			skipDuplicates: true
		}
	});
});

beforeEach(() => {
	cy.login();
});

describe("Single Question", () => {
	beforeEach(() => {
		cy.visit(`/courses/${course.slug}/${lessonSingle.slug}/quiz`);
		cy.get("h1").should("contain.text", lessonSingle.title).should("be.visible");
	});

	it("Opens quiz page", () => {
		cy.byTestId("questionTab").should("have.length", 1);
		cy.byTestId("questionType").should("contain.text", "multiple-choice");
		cy.contains("What is 1+1?");
		cy.byTestId("MultipleChoiceOption").should("have.length", 3);
	});

	it("multiple-choice: Clicking on option", () => {
		// Check first option
		cy.byTestId("MultipleChoiceOption")
			.first()
			.find("input[type=checkbox]")
			.should("not.be.checked");
		cy.byTestId("MultipleChoiceOption").first().click();
		cy.byTestId("MultipleChoiceOption")
			.first()
			.find("input[type=checkbox]")
			.should("be.checked");

		// Check last option
		cy.byTestId("MultipleChoiceOption")
			.last()
			.find("input[type=checkbox]")
			.should("not.be.checked");
		cy.byTestId("MultipleChoiceOption").last().click();
		cy.byTestId("MultipleChoiceOption")
			.last()
			.find("input[type=checkbox]")
			.should("be.checked");

		// Uncheck last option via checkbox
		cy.byTestId("MultipleChoiceOption").last().click();
		cy.byTestId("MultipleChoiceOption")
			.last()
			.find("input[type=checkbox]")
			.should("not.be.checked");
	});

	it("Correct answer -> Quiz completed", () => {
		// Wait for course content to be loaded (otherwise we can't link to next lesson)
		cy.byTestId("chapterTitle").should("be.visible");

		cy.byTestId("MultipleChoiceOption").first().click();
		cy.get("button").contains("Überprüfen").click();
		cy.byTestId("Dialog").should("be.visible");

		// Navigate to next lesson from dialog
		cy.byTestId("Dialog").contains("Zur nächsten Lerneinheit").click();
		cy.url().should("contain", `/courses/${course.slug}/${lessonMultiple.slug}`);
		cy.get("h1").should("contain.text", lessonMultiple.title).should("be.visible");
	});

	it("Incorrect answer -> Quiz failed", () => {
		cy.byTestId("MultipleChoiceOption").last().click();

		cy.get("button").contains("Überprüfen").click();
		cy.byTestId("Dialog").should("be.visible");

		cy.byTestId("Dialog").contains("Nicht Bestanden");
		cy.byTestId("Dialog").find("button").contains("Erneut probieren").click();
		cy.byTestId("Dialog").should("not.exist");

		// Resets state
		cy.byTestId("MultipleChoiceOption").find("input[type=checkbox]").should("not.be.checked");
	});
});

describe("Multiple Questions", () => {
	beforeEach(() => {
		cy.visit(`/courses/${course.slug}/${lessonMultiple.slug}/quiz`);
		cy.get("h1").should("contain.text", lessonMultiple.title).should("be.visible");
	});

	it("Opens quiz page", () => {
		cy.byTestId("questionTab").should("have.length", 2);
		cy.byTestId("questionTab").first().should("have.text", "Frage 1");
		cy.byTestId("questionTab").last().should("have.text", "Frage 2");

		cy.byTestId("questionType").should("contain.text", "multiple-choice");
		cy.contains("What is 1+1?");
	});

	it("Switching between questions", () => {
		cy.byTestId("questionType").should("contain.text", "multiple-choice");

		cy.byTestId("questionTab").last().click();
		cy.byTestId("questionType").should("contain.text", "short-text");

		cy.byTestId("questionTab").first().click();
		cy.byTestId("questionType").should("contain.text", "multiple-choice");
	});

	it("Question answered -> Link to next question", () => {
		cy.byTestId("questionType").should("contain.text", "multiple-choice");
		cy.byTestId("MultipleChoiceOption").first().click();
		cy.get("button").contains("Überprüfen").click();

		cy.get("button").contains("Nächste Frage").click();
		cy.byTestId("questionType").should("contain.text", "short-text");
	});
});
