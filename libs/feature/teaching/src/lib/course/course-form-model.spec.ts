import { ZodError } from "zod";
import { CourseFormModel, courseFormSchema } from "./course-form-model";
import { AccessLevel } from "@prisma/client";

function getErrors(value: unknown) {
	try {
		courseFormSchema.parse(value);
		throw Error("Expected validation error.");
	} catch (error) {
		return (error as ZodError).issues;
	}
}

const minValidCourse: CourseFormModel = {
	title: "A Course",
	slug: "a-course",
	subtitle: "A Subtitle",
	content: [],
	courseId: null,
	description: null,
	imgUrl: null,
	subjectId: null,
	authors: [],
	type: "STATIC",
	version: 1,
	permissions: [
		{
			groupId: 1,
			groupName: "Group 1",
			accessLevel: AccessLevel.FULL
		}
	],
	requires: [],
	provides: []
};

describe("courseFormSchema", () => {
	describe("invalid", () => {
		it("should return error on null input", () => {
			expect(getErrors(null)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "object",
			    "message": "Invalid input: expected object, received null",
			    "path": Array [],
			  },
			]
		`);
		});

		it("should return error on empty {} input", () => {
			const errors = getErrors({});

			expect(
				errors.every(error => ["invalid_type", "invalid_value"].includes(error.code))
			).toBe(true);
		});

		it("missing title", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				title: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Invalid input: expected string, received undefined",
			    "path": Array [
			      "title",
			    ],
			  },
			]
		`);
		});

		it("missing slug", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				slug: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Invalid input: expected string, received undefined",
			    "path": Array [
			      "slug",
			    ],
			  },
			]
		`);
		});

		it("missing content", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				content: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "array",
			    "message": "Invalid input: expected array, received undefined",
			    "path": Array [
			      "content",
			    ],
			  },
			]
		`);
		});
	});

	describe("valid", () => {
		it("minimal information", () => {
			expect(courseFormSchema.safeParse(minValidCourse).success).toBeDefined();
		});

		it("full information", () => {
			const course: CourseFormModel = {
				title: "A Course",
				slug: "a-course",
				subtitle: "A Subtitle",
				type: "STATIC",
				version: 1,
				content: [
					{
						title: "Chapter 1",
						description: "lorem ipsum",
						content: [{ lessonId: "lesson-1" }, { lessonId: "lesson-2" }]
					}
				],
				courseId: "abc",
				description: "A description",
				imgUrl: "http://example.com/image.png",
				subjectId: "subject-1",
				provides: [],
				requires: [],

				authors: [{ username: "author-a" }, { username: "author-b" }],
				permissions: []
			};

			expect(courseFormSchema.safeParse(course).success).toBeDefined();
		});
	});
});
