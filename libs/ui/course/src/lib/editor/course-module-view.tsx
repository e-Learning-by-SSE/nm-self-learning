import React, { useState } from "react";
import { OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { FormProvider, useForm } from "react-hook-form";
import {
	LessonContentEditor,
	LessonFormModel,
	QuizEditor,
	ModuleInfoEditor,
	SkillFolderEditor
} from "@self-learning/teaching";
import { createEmptyLesson, lessonSchema, SkillFormModel } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { DragDropContext } from "@hello-pangea/dnd";

export function CourseModuleView({
	onSubmit,
	initialLesson,
	authorId
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
	authorId: number;
}) {
	const [isDragging, setIsDragging] = useState(false);
	const session = useRequiredSession();
	const tabs = ["Basisdaten", "Lerninhalt", "Lernkontrolle"];
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { data: skills } = trpc.skill.getSkillsByAuthorId.useQuery();
	const allSkills = new Map<string, SkillFormModel>();
	skills?.forEach(skill => {
		allSkills.set(skill.id, skill);
	});
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			//TODO input author here
			authors: []
		},
		resolver: zodResolver(lessonSchema)
	});

	function switchTab(index: number) {
		setSelectedIndex(index);
	}
	const addSkills = (skillsToAdd: SkillFormModel[], field: "provides" | "requires") => {
		form.setValue(field, [
			...(form.getValues(field) ?? []),
			...skillsToAdd.map(skill => ({ ...skill, children: [], parents: [] }))
		]);
	};
	const onDragStart = () => {
		setIsDragging(true);
	};
	const onDragEnd = (result: import("@hello-pangea/dnd").DropResult) => {
		setIsDragging(false);
		if (!result.destination) return;
		if (["provides", "requires"].includes(result.destination.droppableId)) {
			//Filter out the skill ID from the draggableId because only the number after the last colon is the skill ID
			const skillId = result.draggableId.split(":").pop() ?? "";
			const skill = allSkills.get(skillId);
			if (skill) {
				addSkills([skill], result.destination.droppableId as "provides" | "requires");
			}
		}
	};

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <ModuleInfoEditor addSkills={addSkills} />;
			case 1:
				return <LessonContentEditor />;
			case 2:
				return <QuizEditor />;
			default:
				return null;
		}
	};

	return (
		<div className="grid grid-cols-[1fr_2fr] min-h-screen">
			<DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
				<aside className="w-[2fr] min-w-[400px] max-w-[600px] border-r border-light-border bg-white p-6">
					<SkillFolderEditor
						skills={allSkills}
						authorId={authorId}
						isSkilltree={true}
						isDragging={isDragging}
					/>
				</aside>
				<main className="flex-1 min-w-[500px] max-w-[900px] p-8 pr-4 py-4 text-sm">
					<FormProvider {...form}>
						<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
							{tabs.map((content, idx) => (
								<Tab key={idx}>{content}</Tab>
							))}
						</Tabs>
						<div className="items-center justify-center w-full">
							{renderContent(selectedIndex)}
						</div>
						<form id="lessonform" onSubmit={() => {}}></form>
					</FormProvider>
				</main>
			</DragDropContext>
		</div>
	);
}
