import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit as LibLearningUnit,
	Skill as LibSkill,
	Unit,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { JobDefinition } from "../lib/core/job-registry";
import { pathGenerationPayloadSchema } from "../lib/schema/path-generation.schema";
import { z } from "zod";

export const pathGenerationJob: JobDefinition<z.infer<typeof pathGenerationPayloadSchema>, any> = {
	name: "path-generation",
	description: "Generates a learning path based on skills and goals",
	schema: pathGenerationPayloadSchema,
	run: async payload => {
		const fnCost = () => 1;

		const guard: isCompositeGuard<LibLearningUnit> = (
			element: Unit<LibLearningUnit>
		): element is CompositeUnit<LibLearningUnit> => {
			return false;
		};

		const { dbSkills, userGlobalKnowledge, course, lessons, knowledge } = payload;

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
			...payload,
			skills: libSkills ?? [],
			fnCost: fnCost,
			isComposite: guard,
			learningUnits: learningUnits ?? [],
			knowledge: knowledgeLibSkills ?? [],
			goal: goalLibSkills,
			costOptions: DefaultCostParameter
		});

		return result;
	}
};
