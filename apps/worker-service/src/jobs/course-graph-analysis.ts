import {
	And,
	Empty,
	getConnectedGraphForLearningUnit,
	LearningUnit as LibLearningUnit,
	Skill as LibSkill,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { JobDefinition } from "../lib/core/job-registry";
import { courseGraphAnalysisPayloadSchema } from "@self-learning/worker-api";

export const courseGraphAnalysisJob: JobDefinition<"courseGraphAnalysis"> = {
	name: "courseGraphAnalysis",
	description:
		"Creates a graph showing connected and unconnected nodes (skills and learning units) in the course",
	schema: courseGraphAnalysisPayloadSchema,

	run: async payload => {
		const { dbSkills, lessons } = payload;

		const libSkills: LibSkill[] = dbSkills.map(skill => ({
			id: skill.id,
			children: (skill.children ?? []).map(child => child.id)
		}));

		const findSkill = (id: string) => libSkills.find(skill => skill.id === id);

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

		const learningUnits: LibLearningUnit[] = (lessons ?? []).map(lesson => ({
			id: lesson.lessonId,
			requires: convertToExpression((lesson.requires ?? []).map(req => req.id)),
			provides: (lesson.provides ?? [])
				.map(tg => findSkill(tg.id))
				.filter((s: LibSkill | undefined): s is LibSkill => s !== undefined),
			suggestedSkills: []
		}));

		return getConnectedGraphForLearningUnit(learningUnits ?? [], libSkills ?? []);
	}
};
