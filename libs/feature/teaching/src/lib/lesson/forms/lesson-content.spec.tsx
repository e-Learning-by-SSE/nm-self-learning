import React from "react";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { LessonDescriptionForm } from "./lesson-content";

// Define a wrapper component that initializes the form context
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
	test('renders "aktivierungsfrage-element" when lessonType is "SELF_REGULATED"', () => {
		//arrange
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

		//act
		const element = screen.getByTestId("aktivierungsfrage-element");

		//assert
		expect(element).toBeDefined();
	});

	test('does not render "aktivierungsfrage-element" when lessonType is not "SELF_REGULATED"', () => {
		//arrange
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

		//act
		const element = screen.queryByTestId("aktivierungsfrage-element");

		//assert
		expect(element).toBeNull();
	});
});
