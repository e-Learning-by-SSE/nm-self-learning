import { ResourceSkillsFormType, SkillFormModel } from "@self-learning/types";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { LessonSkillManagerDragDrop } from "../lesson/forms/lesson-skill-manager-dragdrop";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { trpc } from "@self-learning/api-client";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useTableSkillDisplay } from "./folder-editor";
import { showToast } from "@self-learning/ui/common";
import { SkillTreeEditor } from "./skill-tree/skill-tree-editor";
import { useMemo, useRef, useState } from "react";
import { SkillResourceProvider } from "./skill-tree/skill-resource-context";
import { SkillCatalogDialog, SkillCatalogDialogState } from "./skill-dialog/skill-catalog-dialog";

/**
 * If you edit a course or standalone lesson - provide nothing
 * If you edit a dynamic course - provide:
 * - courseId if already exists
 * If you edit a nanomodule (lesson of a course) - provide:
 * - courseId
 * - lessonId if already exists
 * @returns
 */
export function SkillsEditor({
	target,
	courseId,
	lessonId
}: {
	target: "lesson" | "course";
	courseId?: string;
	lessonId?: string;
}) {
	const { control, getValues } = useFormContext<ResourceSkillsFormType>();
	const { append: appendProvides, update: updateProvides } = useFieldArray({
		control,
		name: "provides"
	});
	const { append: appendRequires, update: updateRequires } = useFieldArray({
		control,
		name: "requires"
	});

	const requires = useWatch({ control, name: "requires" });
	const provides = useWatch({ control, name: "provides" });

	const { data: ctx } = trpc.course.getSkillContext.useQuery(
		{ courseId: courseId as string },
		{ enabled: !!courseId }
	);

	const requiresSet = useMemo(() => new Set(requires.map(skill => skill.id)), [requires]);
	const providesSet = useMemo(() => new Set(provides.map(skill => skill.id)), [provides]);

	// TODO could be nice also to display course skill goals! - now only display siblings & self
	// TODO who is the author of new skills

	const lessonRequired = useMemo(() => {
		const ids = new Set(target === "lesson" ? requiresSet : []);
		if (!ctx) return ids;
		// append skills from siblings
		for (const lesson of ctx.lessons) {
			if (lesson.lessonId === lessonId) continue; // exclude from the current edited lesson
			for (const id of lesson.requires) ids.add(id);
		}
		return ids;
	}, [requiresSet, ctx, lessonId, target]);

	const lessonProvided = useMemo(() => {
		const ids = new Set(target === "lesson" ? providesSet : []);
		if (!ctx) return ids;
		// append skills from siblings
		for (const lesson of ctx.lessons) {
			if (lesson.lessonId === lessonId) continue; // exclude from the current edited lesson
			for (const id of lesson.provides) ids.add(id);
		}
		return ids;
	}, [providesSet, ctx, lessonId, target]);
	// locked skills - of currently edited resource
	const currentIds = useMemo(
		() => new Set([...requiresSet, ...providesSet]),
		[requiresSet, providesSet]
	);
	// provided by course OR standalone lesson editor
	const courseRequired =
		target === "course" || courseId === undefined ? requiresSet : new Set(ctx?.requires ?? []);
	const courseProvided =
		target === "course" || courseId === undefined ? providesSet : new Set(ctx?.provides ?? []);

	const { data: skills } = trpc.skill.getSkills.useQuery();
	const allSkills = useMemo(() => {
		const skillMap = new Map<string, SkillFormModel>();
		skills?.forEach(skill => skillMap.set(skill.id, skill));
		return skillMap;
	}, [skills]);
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(allSkills);
	const catalog = useMemo(() => Array.from(allSkills.values()), [allSkills]);

	const [dialog, setDialog] = useState<SkillCatalogDialogState>({ kind: "closed" });
	// avoid rerendering the whole tree when dragging a skill
	const treeRef = useRef<HTMLDivElement>(null);

	function addSkills(skillsToAdd: SkillFormModel[], field: "provides" | "requires") {
		const attached = new Set([
			...(getValues("provides") ?? []).map(item => item.id),
			...(getValues("requires") ?? []).map(item => item.id)
		]);
		const append = field === "provides" ? appendProvides : appendRequires;
		for (const skill of skillsToAdd) {
			if (attached.has(skill.id)) {
				showToast({
					type: "error",
					title: "Skill bereits vorhanden",
					subtitle: `Der Skill ${skill.name} ist bereits in der ausgewählten Liste enthalten.`
				});
				continue;
			}
			append(skill);
			attached.add(skill.id);
		}
	}

	function onDragEnd(result: DropResult) {
		const destination = result.destination?.droppableId;
		if (destination !== "provides" && destination !== "requires") return;
		//Filter out the skill ID from the draggableId because only the number after the last colon is the skill ID
		// TODO ::: is used as separator - contract must be declared in one place or use separator as constant
		const skillId = result.draggableId.split(":::").pop() ?? "";
		const skill = allSkills.get(skillId);
		if (skill) addSkills([skill], destination);
	}

	function onSkillUpdated(skillId: string, name: string, description: string) {
		const { provides: provided, requires: required } = getValues();
		provided.forEach((item, index) => {
			if (item.id === skillId) updateProvides(index, { ...item, name, description });
		});
		required.forEach((item, index) => {
			if (item.id === skillId) updateRequires(index, { ...item, name, description });
		});
	}

	return (
		<SkillResourceProvider
			lessonRequired={lessonRequired}
			lessonProvided={lessonProvided}
			courseRequired={courseRequired}
			courseProvided={courseProvided}
			current={currentIds}
		>
			{/* SkillResourceProvider wraps lists + dialogs too so SelectSkillDialog can show puzzle/star/folder overlay */}
			<DragDropContext
				onDragStart={() => treeRef.current?.classList.add("is-dragging")}
				onDragEnd={result => {
					treeRef.current?.classList.remove("is-dragging");
					onDragEnd(result);
				}}
			>
				<div ref={treeRef}>
					<SidebarEditorLayout
						sidebar={
							<SkillTreeEditor
								skillDisplayData={skillDisplayData}
								updateSkillDisplay={updateSkillDisplay}
								onSkillSelect={id => {
									if (id) setDialog({ kind: "edit", skillId: id });
								}}
								onSkillCreate={opts =>
									setDialog({
										kind: "create",
										defaultName: opts?.name ?? "",
										parentId: opts?.parentId
									})
								}
							/>
						}
					>
						<LessonSkillManagerDragDrop
							addSkills={addSkills}
							excludeIds={currentIds}
							catalog={catalog}
						/>
					</SidebarEditorLayout>
				</div>
			</DragDropContext>
			<SkillCatalogDialog
				dialog={dialog}
				skills={allSkills}
				onClose={() => setDialog({ kind: "closed" })}
				onUpdated={onSkillUpdated}
			/>
		</SkillResourceProvider>
	);
}
