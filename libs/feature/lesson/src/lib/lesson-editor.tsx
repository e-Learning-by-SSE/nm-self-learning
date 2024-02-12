import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { LessonFormModel } from "@self-learning/teaching";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { LessonContentEditor } from "../../../teaching/src/lib/lesson/forms/lesson-content";
import { QuizEditor } from "../../../teaching/src/lib/lesson/forms/quiz-editor";
import { LessonInfoEditor } from "../../../teaching/src/lib/lesson/forms/lesson-info";

export async function onLessonCreatorClosed(
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => any,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			console.log("Creating lesson...", lesson);
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
		}
		onClose();
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Lerneinheit konnte nicht erstellt werden."
		});
	}
}

export async function onLessonEditorClosed(
	onClose: () => void,
	editLessonAsync: (lesson: any) => any,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			const result = await editLessonAsync({
				lesson: lesson,
				lessonId: lesson.lessonId as string
			});
			showToast({
				type: "success",
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
		}
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Die Lernheit konnte nicht gespeichert werden."
		});
	}
}

export function LessonEditor({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const [selectedLessonType, setLessonType] = useState(initialLesson?.lessonType);
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onClose, console.log)}
				className="flex h-full flex-col overflow-hidden"
			>
				<div className="flex h-full flex-col gap-4 overflow-hidden">
					<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
						<Tab>Lerneinheit</Tab>
						<Tab>Lernkontrolle</Tab>
					</Tabs>
					<div className="playlist-scroll flex h-full flex-col gap-4 overflow-auto">
						{selectedTab === 0 && (
							<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
								<LessonInfoEditor
									lesson={initialLesson}
									setLessonType={setLessonType}
								/>
								<LessonContentEditor />
							</div>
						)}
						{selectedTab === 1 && <QuizEditor />}
					</div>
				</div>

				<DialogActions onClose={onClose}>
					<button type="submit" className="btn-primary">
						Speichern
					</button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}
