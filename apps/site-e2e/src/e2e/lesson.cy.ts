import {
	CourseContent,
	createChapter,
	createCourseContent,
	createLesson
} from "@self-learning/types";
import { createExampleCourse, createExampleLessonsFromContent } from "@self-learning/util/testing";
import { runCommand } from "../support/util";

const testId = "lesson-cy";

const courseContent = createCourseContent([
	createChapter("Chapter 1", [
		createLesson("lesson-1"),
		createLesson("lesson-2"),
		createLesson("lesson-3")
	]),
	createChapter("Chapter 2", [
		createLesson("lesson-4"),
		createLesson("lesson-5"),
		createLesson("lesson-6")
	])
]);

const TEST_COURSE = createExampleCourse(`${testId}-course`, courseContent);

before(() => {
	runCommand({
		command: "upsertCourse",
		payload: {
			create: TEST_COURSE,
			update: {}, // Can be empty, since we do not modify the course here
			lessons: {
				data: createExampleLessonsFromContent(TEST_COURSE.content as CourseContent),
				skipDuplicates: true
			}
		}
	});
});

beforeEach(() => {
	cy.login();
	cy.visit(`/courses/${TEST_COURSE.courseId}/lesson-1`);
	cy.get("h1").should("contain.text", "Lesson lesson-1").should("be.visible");
});

it("Opens lesson page", () => {
	cy.get("h1").should("contain.text", "Lesson lesson-1").should("be.visible");
});

it("Playlist shows content", () => {
	cy.byTestId("chapterTitle").should("have.length", 2);
	cy.byTestId("lessonTitle").should("have.length", 6);
});

it("Currently Playing: Shows current chapter and lesson", () => {
	cy.byTestId("CurrentlyPlaying").contains("Chapter 1");
	cy.byTestId("CurrentlyPlaying").contains("Lesson lesson-1");
});

it("Currently Playing: Navigate between lessons", () => {
	// First lesson -> Can't go back
	cy.byTestId("previousLessonButton").should("be.disabled");

	cy.byTestId("nextLessonButton").click();
	cy.url().should("include", "/lesson-2");

	cy.byTestId("previousLessonButton").should("not.be.disabled");
	cy.byTestId("previousLessonButton").click();
	cy.url().should("include", "/lesson-1");

	// Last lesson -> Can't go forward
	cy.visit(`/courses/${TEST_COURSE.courseId}/lesson-6`);
	cy.byTestId("nextLessonButton").should("be.disabled");
});

it("Currently Playing: Lesson has quiz -> Navigate to quiz", () => {
	cy.byTestId("CurrentlyPlaying").contains("Lernkontrolle").click();
	cy.url().should("include", "/quiz");
	cy.byTestId("questionType").should("contain", "multiple-choice");
});

it("Lesson has quiz -> Navigate to quiz", () => {
	cy.get("a").contains("Zur Lernkontrolle").click();
	cy.url().should("include", "/quiz");
	cy.byTestId("questionType").should("contain", "multiple-choice");
});

it("MediaTypeSelector: Switch between video and article", () => {
	cy.byTestId("mediaTypeTab").should("have.length", 2);

	// Shows video by default
	cy.get("video").should("be.visible");

	cy.byTestId("mediaTypeTab").contains("video").should("be.visible");
	cy.byTestId("mediaTypeTab").contains("article").click();

	cy.url().should("include", "type=article");
	cy.contains("Hello World");
	cy.get("video").should("not.exist");
});
