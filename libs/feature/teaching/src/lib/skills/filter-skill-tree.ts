import type { SkillFolderVisualization } from "./folder-editor/skill-display";
import type { SkillIdLookup } from "./skill-tree-rows";
import { compareSkills } from "./compare-skills";

export function filterSkillTree(
	skills: Map<string, SkillFolderVisualization>,
	searchTerm: string,
	accessibleSkillIds?: SkillIdLookup
) {
	const normalized = searchTerm.toLowerCase().trim();
	const allSkills = Array.from(skills.values());
	const matchingSkillIds = new Set(
		allSkills
			.filter(skill => {
				const matchesName =
					skill.skill.name.toLowerCase().includes(normalized) ||
					skill.displayName?.toLowerCase().includes(normalized);
				return matchesName && (!accessibleSkillIds || accessibleSkillIds.has(skill.id));
			})
			.map(skill => skill.id)
	);
	const visibleSkillIds = new Set(matchingSkillIds);
	const autoExpandIds = new Set<string>();
	const pending = Array.from(matchingSkillIds);
	const visited = new Set<string>();
	while (pending.length > 0) {
		const skillId = pending.pop();
		if (skillId === undefined || visited.has(skillId)) continue;
		visited.add(skillId);
		for (const parentId of skills.get(skillId)?.skill.parents ?? []) {
			visibleSkillIds.add(parentId);
			// Matching parents must also open to reveal their matching descendants.
			if (normalized.length > 0 || !matchingSkillIds.has(parentId)) {
				autoExpandIds.add(parentId);
			}
			pending.push(parentId);
		}
	}
	const skillsToDisplay = allSkills
		.filter(
			skill =>
				(skill.skill.parents.length === 0 || skill.isCycleMember) &&
				visibleSkillIds.has(skill.id)
		)
		.sort((a, b) =>
			compareSkills(
				{ numberChildren: a.numberChildren, name: a.skill.name },
				{ numberChildren: b.numberChildren, name: b.skill.name }
			)
		);
	return { skillsToDisplay, matchingSkillIds, autoExpandIds };
}
