import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { LessonDescriptionForm } from "./lesson-content";

function FormWrapper({
	defaultValues,
	children
}: {
	defaultValues: any;
	children: React.ReactNode;
}) {
	const methods = useForm({ defaultValues });
	return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("LessonDescriptionForm", () => {
	it('should show "aktivierungsfrage" input when lessonType is SELF_REGULATED', () => {
		// Arrange
		render(
			<FormWrapper
				defaultValues={{
					lessonType: "SELF_REGULATED",
					selfRegulatedQuestion: "What is your motivation?",
					description: "Some description"
				}}
			>
				<LessonDescriptionForm />
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
				<LessonDescriptionForm />
			</FormWrapper>
		);

		// Act
		const element = screen.queryByTestId("aktivierungsfrage-element");

		// Assert
		expect(element).toBeNull();
	});
});
