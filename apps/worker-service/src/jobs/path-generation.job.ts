import {
	And,
	CompositeUnit,
	DefaultCostParameter,
	Empty,
	getPath,
	isCompositeGuard,
	LearningUnit as LibLearningUnit,
	Skill as LibSkill,
	Path,
	Unit,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { JobDefinition } from "../lib/core/job-registry";

export const pathGenerationJob: JobDefinition<"pathGeneration"> = {
	name: "pathGeneration",
	description: "Generates a learning path based on skills and goals",

	run: async payload => {
		const { dbSkills, goal, lessons, knowledge } = payload;

		// TODO SE: May be replaced by estimated time
		const fnCost = () => 1;

		// TODO SE: Supported by library, but not by the platform
		const guard: isCompositeGuard<LibLearningUnit> = (
			_element: Unit<LibLearningUnit>
		): _element is CompositeUnit<LibLearningUnit> => {
			return false;
		};

		const libSkills: LibSkill[] = dbSkills.map(skill => ({
			id: skill.id,
			children: (skill.children ?? []).map(child => child.id)
		}));

		// Used to resolve skills
		const findSkill = (id: string) => libSkills.find(skill => skill.id === id);

		const goalLibSkills: LibSkill[] = goal.map(goal => ({
			id: goal.id,
			children: (goal.children ?? []).map(child => child.id)
		}));

		const knowledgeLibSkills: LibSkill[] = (knowledge ?? [])
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

		const learningUnits: LibLearningUnit[] = lessons.map(lesson => ({
			id: lesson.lessonId,
			requires: convertToExpression((lesson.requires ?? []).map(req => req.id)),
			provides: (lesson.provides ?? [])
				.map(tg => findSkill(tg.id))
				.filter((s: LibSkill | undefined): s is LibSkill => s !== undefined),
			suggestedSkills: []
		}));

		const result = getPath({
			...payload,
			skills: libSkills ?? [],
			fnCost: fnCost,
			isComposite: guard,
			learningUnits: learningUnits,
			knowledge: knowledgeLibSkills,
			goal: goalLibSkills,
			costOptions: DefaultCostParameter
		});

		if (result == null || result.path.length === 0) {
			return null;
		}

		return {
			lessonIds: extractLearningUnitIds(result),
			cost: result.cost
		};
	}
};

function extractLearningUnitIds(path: Path<LibLearningUnit>): string[] {
	return [...(path.origin ? [path.origin.id] : []), ...path.path.flatMap(extractLearningUnitIds)];
}
