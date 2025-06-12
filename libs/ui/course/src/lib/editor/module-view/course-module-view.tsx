import React, { useState } from "react";
import { showToast, Tab, Tabs } from "@self-learning/ui/common";
import { FormProvider, useForm } from "react-hook-form";
import {
	LessonContentEditor,
	LessonFormModel,
	QuizEditor,
	ModuleInfoEditor,
} from "@self-learning/teaching";
import { createEmptyLesson, lessonSchema, SkillFormModel } from "@self-learning/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { DragDropContext } from "@hello-pangea/dnd";
import { ModuleDependency } from "./module-dependency";

export function CourseModuleView({
	initialLesson,
	authorId,
	modules,
	setModules
}: {
	initialLesson?: LessonFormModel;
	authorId: number;
	modules: Map<string, LessonFormModel>;
	setModules: React.Dispatch<React.SetStateAction<Map<string, LessonFormModel>>>;
}) {
	const [isDragging, setIsDragging] = useState(false);
	const tabs = ["Basisdaten", "Lerninhalt", "Lernkontrolle"];
	const [selectedIndex, setSelectedIndex] = useState(0);
	const { data: skills } = trpc.skill.getSkillsByAuthorId.useQuery();
	const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
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
	// Needed to prevent reloading the skills when dragging skills
	const onDragStart = () => {
		setIsDragging(true);
	};
	const onSubmit = form.handleSubmit((lesson: LessonFormModel) => {
		const id = selectedModuleId ?? lesson.lessonId ?? crypto.randomUUID();
		const updatedModules = new Map(modules);
		updatedModules.set(id, { ...lesson, lessonId: id });
		setModules(updatedModules);
		setSelectedModuleId(null);
		showToast({
			type: "success",
			title: "Modul gespeichert!",
			subtitle: lesson.title
		});
		form.reset(createEmptyLesson());
	});
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
	function handleModuleClick(id: string) {
		const lesson = modules.get(id);
		if (lesson) {
			form.reset(lesson); // this loads the data into the form
			setSelectedModuleId(id);
		}
	}
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
					<ModuleDependency
						skills={allSkills}
						authorId={authorId}
						isDragging={isDragging}
						modules={modules}
						onSelectModule={handleModuleClick}
					/>
				</aside>
				<main className="flex-1 min-w-[500px] max-w-[900px] p-8 pr-4 py-4 text-sm">
					<FormProvider {...form}>
						<form
							id="lessonform"
							onSubmit={onSubmit}
							className="flex flex-col h-full justify-between"
						>
							<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
								{tabs.map((content, idx) => (
									<Tab key={idx}>{content}</Tab>
								))}
							</Tabs>

							<div className="flex-grow">{renderContent(selectedIndex)}</div>

							<div className="flex justify-end mb-8">
								<button className="btn btn-primary" type="submit">
									Modul Hinzufügen
								</button>
							</div>
						</form>
					</FormProvider>
				</main>
			</DragDropContext>
		</div>
	);
}
