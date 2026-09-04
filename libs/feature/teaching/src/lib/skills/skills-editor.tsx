import { ResourceSkillsFormType, SkillFormModel } from "@self-learning/types";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { LessonSkillManagerDragDrop } from "../lesson/forms/lesson-skill-manager-dragdrop";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTableSkillDisplay } from "./folder-editor";
import { showToast } from "@self-learning/ui/common";
import { SkillTreeEditor } from "./skill-tree/skill-tree-editor";
import { useMemo } from "react";

/**
 * If you edit course or standalone lesson - provide nothing
 * If you edit a nanomodule (lesson of a course) - provide:
 * - courseId
 * - lessonId if already exists
 * @returns
 */
export function SkillsEditor({
	courseId,
	lessonId
}: {
	//
	courseId?: string;
	lessonId?: string;
}) {
	const { control, getValues } = useFormContext<ResourceSkillsFormType>();
	const { append: appendProvides } = useFieldArray({ control, name: "provides" });
	const { append: appendRequires } = useFieldArray({ control, name: "requires" });

	const requires = useWatch({ control, name: "requires" });
	const provides = useWatch({ control, name: "provides" });

	const { data: ctx } = trpc.course.getSkillContext.useQuery(
		{ courseId: courseId as string },
		{ enabled: !!courseId }
	);

	const requiresSet = useMemo(() => new Set(requires.map(skill => skill.id)), [requires]);
	const providesSet = useMemo(() => new Set(provides.map(skill => skill.id)), [provides]);

	// TODO allow to add new skills
	// const session = useRequiredSession();
	// const username = session.data?.user?.name;
	// const { data: author, isLoading } = trpc.author.getByUsername.useQuery(
	// 	{ username: username as string },
	// 	{ enabled: !!username }
	// );

	// TODO could be nice also to display course skill goals! - now only display siblings & self
	// TODO who is the author of new skills

	const requiredIds = useMemo(() => {
		const ids = new Set(requiresSet);
		if (!ctx) return ids;
		// append skills from siblings
		for (const lesson of ctx.lessons) {
			if (lesson.lessonId === lessonId) continue; // exclude from the current edited lesson
			for (const id of lesson.requires) ids.add(id);
		}
		return ids;
	}, [requiresSet, ctx, lessonId]);

	const providedIds = useMemo(() => {
		const ids = new Set(providesSet);
		if (!ctx) return ids;
		// append skills from siblings
		for (const lesson of ctx.lessons) {
			if (lesson.lessonId === lessonId) continue; // exclude from the current edited lesson
			for (const id of lesson.provides) ids.add(id);
		}
		return ids;
	}, [providesSet, ctx, lessonId]);

	const currentIds = useMemo(
		() => new Set([...requiresSet, ...providesSet]),
		[requiresSet, providesSet]
	);

	const { data: skills } = trpc.skill.getSkills.useQuery();
	const allSkills = useMemo(() => {
		const skillMap = new Map<string, SkillFormModel>();
		skills?.forEach(skill => skillMap.set(skill.id, skill));
		return skillMap;
	}, [skills]);
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(allSkills);

	const onDragEnd = (result: DropResult) => {
		const destination = result.destination?.droppableId;
		if (destination !== "provides" && destination !== "requires") {
			return;
		}
		//Filter out the skill ID from the draggableId because only the number after the last colon is the skill ID
		// TODO ::: is used as separator - contract must be declared in one place or use separator as constant
		const skillId = result.draggableId.split(":::").pop() ?? "";
		const skill = allSkills.get(skillId);
		if (!skill) return;

		console.log("draggableId", result.draggableId);
		console.log(`skill with id ${skillId} is `, skill);

		const { provides, requires } = getValues();
		const alreadyAttached =
			provides?.some(s => s.id === skillId) || requires?.some(s => s.id === skillId);
		if (alreadyAttached) {
			showToast({
				type: "error",
				title: "Skill bereits vorhanden",
				subtitle: `Der Skill ${skill?.name} ist bereits in der ausgewählten Liste enthalten.`
			});
			return;
		}
		if (destination === "provides") {
			appendProvides(skill);
		} else {
			appendRequires(skill);
		}
	};

	return (
		<div>
			<DragDropContext onDragEnd={onDragEnd}>
				<SidebarEditorLayout
					sidebar={
						<SkillTreeEditor
							skillDisplayData={skillDisplayData}
							updateSkillDisplay={updateSkillDisplay}
							onSkillSelect={id => {
								console.log("selected skill id", id);
							}}
							requiredIds={requiredIds}
							providedIds={providedIds}
							currentIds={currentIds}
						/>
					}
				>
					<LessonSkillManagerDragDrop />
				</SidebarEditorLayout>
			</DragDropContext>
		</div>
	);
}
