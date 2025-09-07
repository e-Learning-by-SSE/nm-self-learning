/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort } from "worker_threads";
import {
	And,
	CompositeUnit,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit as LibLearningUnit,
	Skill as LibSkill,
	Unit,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";

if (!parentPort) {
	throw new Error("This script must be run as a worker thread.");
}

parentPort.on("message", async data => {
	try {
		if (data.type === "generatePath") {
			const fnCost = () => 1;

			const guard: isCompositeGuard<LibLearningUnit> = (
				element: Unit<LibLearningUnit>
			): element is CompositeUnit<LibLearningUnit> => {
				return false;
			};

			const { dbSkills, userGlobalKnowledge, course, lessons, knowledge } = data.payload;

			const userGlobalKnowledgeIds = (userGlobalKnowledge?.received ?? []).map(
				(skill: any) => skill.id
			);

			const userKnowledge = [...(knowledge ?? []), ...userGlobalKnowledgeIds];

			const libSkills: LibSkill[] = (dbSkills ?? []).map((skill: any) => ({
				id: skill.id,
				repositoryId: skill.repositoryId,
				children: (skill.children ?? []).map((child: any) => child.id)
			}));

			const findSkill = (id: string) => libSkills.find(skill => skill.id === id);

			const goalLibSkills: LibSkill[] = (course.teachingGoals ?? []).map((goal: any) => ({
				id: goal.id,
				repositoryId: goal.repositoryId,
				children: (goal.children ?? []).map((child: any) => child.id)
			}));

			const knowledgeLibSkills: LibSkill[] = userKnowledge
				.map(skillId => findSkill(skillId))
				.filter((skill): skill is LibSkill => !!skill);

			const convertToExpression = (skillIds?: string[]): And | Empty => {
				if (!skillIds || skillIds.length === 0) {
					return new Empty();
				}
				const skills = skillIds
					.map(id => findSkill(id))
					.filter((s): s is LibSkill => s !== undefined);

				if (skills.length === 0) {
					return new Empty();
				}
				const variables = skills.map(skill => new Variable(skill));
				return new And(variables);
			};

			const learningUnits: LibLearningUnit[] = (lessons ?? []).map((lesson: any) => ({
				id: lesson.lessonId,
				requires: convertToExpression((lesson.requires ?? []).map((req: any) => req.id)),
				provides: (lesson.provides ?? [])
					.map((tg: any) => findSkill(tg.id))
					.filter((s: LibSkill | undefined): s is LibSkill => s !== undefined),
				suggestedSkills: []
			}));

			const result = getPath({
				...data.payload,
				skills: libSkills ?? [],
				fnCost: fnCost,
				isComposite: guard,
				learningUnits: learningUnits ?? [],
				knowledge: knowledgeLibSkills ?? [],
				goal: goalLibSkills
			});
			parentPort?.postMessage(result);
			return;
		}

		const result = { error: "Unknown message type" };
		parentPort?.postMessage(result);
	} catch (error) {
		console.error("Worker error:", error);
		parentPort?.postMessage({ error: (error as Error).message });
	}
});
