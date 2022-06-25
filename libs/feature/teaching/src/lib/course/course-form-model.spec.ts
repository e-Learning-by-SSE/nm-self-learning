import { validationConfig } from "@self-learning/util/validate";
import { ValidationError } from "yup";
import { CourseFormModel, courseFormSchema } from "./course-form-model";

function getErrors(value: unknown) {
	try {
		courseFormSchema.validateSync(value, validationConfig);
		throw Error("Expected validation error.");
	} catch (error) {
		return (error as ValidationError).errors;
	}
}

const minValidCourse: CourseFormModel = {
	title: "A Course",
	slug: "a-course",
	subtitle: "A Subtitle",
	content: [],
	courseId: undefined,
	description: undefined,
	imgUrl: undefined,
	subjectId: undefined
};

describe("courseFormSchema", () => {
	describe("invalid", () => {
		it("null", () => {
			expect(getErrors(null)).toMatchInlineSnapshot(`
			Array [
			  "this must be a \`object\` type, but the final value was: \`null\`.
			 If \\"null\\" is intended as an empty value be sure to mark the schema as \`.nullable()\`",
			]
		`);
		});

		it("{}", () => {
			expect(getErrors({})).toMatchInlineSnapshot(`
			Array [
			  "slug is a required field",
			  "subtitle is a required field",
			  "title is a required field",
			  "content is a required field",
			]
		`);
		});

		it("missing title", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				title: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  "title is a required field",
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
			  "slug is a required field",
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
			  "content is a required field",
			]
		`);
		});
	});

	describe("valid", () => {
		it("minimal information", () => {
			expect(courseFormSchema.isValidSync(minValidCourse)).toEqual(true);
		});

		it("full information", () => {
			const course: CourseFormModel = {
				title: "A Course",
				slug: "a-course",
				subtitle: "A Subtitle",
				content: [
					{
						chapterId: "a",
						title: "A Chapter",
						description: "a description",
						lessons: [
							{
								lessonId: "la",
								slug: "lesson-a",
								title: "A lesson"
							}
						]
					}
				],
				courseId: "abc",
				description: "A description",
				imgUrl: "http://example.com/image.png",
				subjectId: 1
			};

			expect(courseFormSchema.isValidSync(course)).toEqual(true);
		});
	});
});
