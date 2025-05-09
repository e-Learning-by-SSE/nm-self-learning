import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

type FormValues = {
	lessonType: string;
	selfRegulatedQuestion?: string;
	description?: string;
};

function FormWrapper({
	defaultValues,
	children
}: {
	defaultValues: FormValues;
	children: React.ReactNode;
}) {
	const methods = useForm({ defaultValues });
	return <FormProvider {...methods}>{children}</FormProvider>;
}

function MockLessonForm() {
	const { watch } = useFormContext();
	const lessonType = watch("lessonType");

	if (lessonType === "SELF_REGULATED") {
		return <div data-testid="aktivierungsfrage-element">Aktivierungsfrage</div>;
	}
	return null;
}

describe("MockLessonForm", () => {
	it('should show "aktivierungsfrage" input when lessonType is SELF_REGULATED', () => {
		// Arrange
		render(
			<FormWrapper
				defaultValues={{
					lessonType: "SELF_REGULATED",
					selfRegulatedQuestion: "What is your motivation?",
				}}
			>
				<MockLessonForm />
			</FormWrapper>
		);

		// Act
		const element = screen.getByTestId("aktivierungsfrage-element");

		// Assert
		expect(element).toBeDefined();
	});

	it('should not show "aktivierungsfrage" input when lessonType is TRADITIONAL', () => {
		// Arrange
		render(
			<FormWrapper
				defaultValues={{
					lessonType: "TRADITIONAL",
					selfRegulatedQuestion: "What is your motivation?",
					description: "Some description"
				}}
			>
				<MockLessonForm />
			</FormWrapper>
		);

		// Act
		const element = screen.queryByTestId("aktivierungsfrage-element");

		// Assert
		expect(element).toBeNull();
	});
});
