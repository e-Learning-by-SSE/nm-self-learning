import {
	And,
	Empty,
	getConnectedGraphForLearningUnit,
	LearningUnit as LibLearningUnit,
	Skill as LibSkill,
	Variable
} from "@e-learning-by-sse/nm-skill-lib";
import { JobDefinition } from "../lib/core/job-registry";

export const courseGraphAnalysisJob: JobDefinition<"courseGraphAnalysis"> = {
	name: "courseGraphAnalysis",
	description:
		"Creates a graph showing connected and unconnected nodes (skills and learning units) in the course",

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

		// Actual computation
		const resultGraph = getConnectedGraphForLearningUnit(learningUnits ?? [], libSkills ?? []);

		// Temporary structures to ease retrieval
		const elementIdByNodeId = new Map(resultGraph.nodes.map(node => [node.id, node.element.id]));
		const elementIds = resultGraph.nodes.map(node => node.element.id);
		const learningUnitIds = new Set(learningUnits.map(learningUnit => learningUnit.id));
		const skillIds = new Set(libSkills.map(skill => skill.id));

		return {
			// Use IDs of platform instead of artificial references of the algorithm
			nodes: elementIds,

			// Map edges to use platform IDs instead of algorithm references
			edges: resultGraph.edges
				.map(edge => {
					const from = elementIdByNodeId.get(edge.from);
					const to = elementIdByNodeId.get(edge.to);
					return from && to ? { from, to } : null;
				})
				.filter((edge): edge is { from: string; to: string } => edge !== null),

			// Filter for relevant / used learning units
			learningUnits: elementIds.filter(id => learningUnitIds.has(id)),

			// Filter for relevant / used skills
			skills: elementIds.filter(id => skillIds.has(id))
		};
	}
};
