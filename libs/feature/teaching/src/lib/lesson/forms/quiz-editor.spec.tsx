import { zodResolver } from "@hookform/resolvers/zod";
import { AccessLevel } from "@prisma/client";
import { createEmptyLesson, Lesson, lessonSchema } from "@self-learning/types";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { useQuizEditorForm } from "./quiz-editor";

it("saves a lesson after opening the quiz editor without adding questions", async () => {
	//Setup
	let form!: UseFormReturn<z.input<typeof lessonSchema>, unknown, Lesson>;
	const onSubmit = jest.fn();
	const onInvalid = jest.fn();

	function Wrapper({ children }: { children: ReactNode }) {
		form = useForm<z.input<typeof lessonSchema>, unknown, Lesson>({
			defaultValues: {
				...createEmptyLesson(),
				title: "New lesson",
				slug: "new-lesson",
				permissions: [{ groupId: 1, groupName: "Group", accessLevel: AccessLevel.FULL }]
			},
			resolver: zodResolver(lessonSchema)
		});

		return <FormProvider {...form}>{children}</FormProvider>;
	}

	// Exercise
	renderHook(() => useQuizEditorForm(), { wrapper: Wrapper });

	await act(async () => {
		await form.handleSubmit(onSubmit, onInvalid)();
	});

	// Verify
	expect(onInvalid).not.toHaveBeenCalled();
	expect(onSubmit).toHaveBeenCalledWith(
		expect.objectContaining({ quiz: { questions: [], questionOrder: [] } }),
		undefined
	);
});
