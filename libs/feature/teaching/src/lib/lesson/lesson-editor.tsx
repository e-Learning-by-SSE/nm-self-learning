import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema, LessonDraft } from "@self-learning/types";
import { OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";

export async function onLessonCreatorSubmit(
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => Promise<{
		title: string;
	}>,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lerneinheit erstellt", subtitle: result.title });
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

export async function onLessonEditorSubmit(
	onClose: () => void,
	editLessonAsync: (lesson: {
		lesson: LessonFormModel;
		lessonId: string;
	}) => Promise<{ title: string }>,
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
	onSubmit,
	initialLesson,
	isFullScreen,
	draftId
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
	isFullScreen: boolean;
	draftId?: string | undefined;
}) {
	const session = useRequiredSession();
	const router = useRouter();
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

	const { mutateAsync: create } = trpc.lessonDraft.create.useMutation();

	const lastSavedDraftRef = useRef<LessonDraft | null>(null);
	const toastShownRef = useRef(false);

	const saveLessonDraft = async () => {
		const formValues = form.getValues();

		const draft = {
			...formValues,
			id: undefined,
			owner: session.data?.user.isAuthor
				? { username: session.data?.user.name }
				: { username: "" }
		};

		if (JSON.stringify(draft) === JSON.stringify(lastSavedDraftRef.current)) {
			console.log("Draft is unchanged. Skipping autosave.");
			return;
		}

		console.log("Autosaving draft: ", draft);

		try {
			await create(draft);
			lastSavedDraftRef.current = draft;
		} catch (err) {
			console.log("Error during autosave", err);
		}
	};

	useEffect(() => {
		if (!draftId) {
			const interval = setInterval(() => {
				saveLessonDraft();
			}, 5000); // 5 seconds

			return () => {
				clearInterval(interval);
			};
		} else {
			if (!toastShownRef.current) {
				showToast({ type: "info", title: "Das ist ein Entwurf", subtitle: "" });
				toastShownRef.current = true;
			}
			console.log("Draft loaded -> no autosave. ", draftId);
		}
	}, [session.data]);

	const [showSaveOptions, setShowSaveOptions] = useState(false);

	const handleSave = () => {
		form.handleSubmit(onSubmit)();
		setShowSaveOptions(false);
	};

	const handleSaveAsDraft = () => {
		setShowSaveOptions(false);
		saveLessonDraft();
		router.back();
	};

	const { mutateAsync: deleteDraft } = trpc.lessonDraft.delete.useMutation();

	const handleCancel = async () => {
		if (draftId) {
			await deleteDraft({ draftId: draftId });
		}

		router.back();
	};

	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				className="flex h-full flex-col overflow-hidden"
			>
				<div className="flex h-full overflow-y-auto overflow-x-hidden">
					{selectedTab === 0 && (
						<FirstTabContent
							initialLesson={initialLesson}
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
					)}
					{selectedTab === 1 && (
						<SecondTabContent
							initialLesson={initialLesson}
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
					)}
				</div>

				<div
					className={`${
						isFullScreen ? "fixed" : ""
					} bottom-0 flex w-full items-end justify-end`}
				>
					<div className={`${isFullScreen ? "absolute" : "fixed"} z-50 pr-5 pb-5`}>
						<div className="flex justify-end space-x-2 mt-4">
							<button type="button" onClick={handleCancel} className="btn-secondary">
								Abbrechen
							</button>
							<button
								type="button"
								onClick={() => setShowSaveOptions(!showSaveOptions)}
								className="btn-primary pointer-events-auto flex items-center gap-2"
							>
								Speichern
								<span
									className={`transform transition-transform ${showSaveOptions ? "rotate-180" : ""}`}
								>
									&#x25BC;
								</span>
							</button>
							{showSaveOptions && (
								<div className="mt-2 ml-4 space-y-2">
									<button
										type="button"
										onClick={handleSave}
										className="btn-primary pointer-events-auto w-full"
									>
										Speichern
									</button>
									<button
										type="button"
										onClick={handleSaveAsDraft}
										className="btn-primary pointer-events-auto w-full"
									>
										Als Entwurf Speichern
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

function FirstTabContent({
	initialLesson,
	selectedTab,
	setSelectedTab
}: {
	initialLesson?: LessonFormModel;
	selectedTab: number;
	setSelectedTab: (v: number) => void;
}) {
	return (
		<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
			<LessonInfoEditor lesson={initialLesson} />

			<div>
				<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
					<Tab>Lerninhalt</Tab>
					<Tab>Lernkontrolle</Tab>
				</Tabs>
				<LessonContentEditor />
			</div>
		</div>
	);
}

function SecondTabContent({
	initialLesson,
	selectedTab,
	setSelectedTab
}: {
	initialLesson?: LessonFormModel;
	selectedTab: number;
	setSelectedTab: (v: number) => void;
}) {
	return (
		<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
			<LessonInfoEditor lesson={initialLesson} />

			<div>
				<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
					<Tab>Lerninhalt</Tab>
					<Tab>Lernkontrolle</Tab>
				</Tabs>
				<QuizEditor />
			</div>
		</div>
	);
}
