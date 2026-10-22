import { formatLessonValidationErrors } from "./lesson-editor";

describe("formatLessonValidationErrors", () => {
	const translate = jest.fn((key: string, options?: { field: string; message: string }) => {
		if (key === "Lesson_Validation_Question_Order_Required") {
			return "Wenn Fragen vorhanden sind, ist eine Fragenreihenfolge erforderlich.";
		}
		if (key === "Lesson_Validation_Field_Error") {
			return `${options?.field}: ${options?.message}`;
		}
		return key;
	});

	beforeEach(() => translate.mockClear());

	it("translates the required question order message", () => {
		// Exercise
		const message = formatLessonValidationErrors(
			{
				quiz: {
					questionOrder: {
						type: "custom",
						message: "A question order is required when questions are present"
					}
				}
			},
			translate as Parameters<typeof formatLessonValidationErrors>[1]
		);

		// Verify
		expect(message).toBe(
			"quiz.questionOrder: Wenn Fragen vorhanden sind, ist eine Fragenreihenfolge erforderlich."
		);
		expect(translate).toHaveBeenCalledWith("Lesson_Validation_Question_Order_Required");
	});

	it("keeps the original message for malformed question order data", () => {
		// Exercise
		const message = formatLessonValidationErrors(
			{
				quiz: {
					questionOrder: { type: "invalid_type", message: "Expected an array" }
				}
			},
			translate as Parameters<typeof formatLessonValidationErrors>[1]
		);

		// Verify
		expect(message).toBe("quiz.questionOrder: Expected an array");
		expect(translate).not.toHaveBeenCalledWith("Lesson_Validation_Question_Order_Required");
	});
});
