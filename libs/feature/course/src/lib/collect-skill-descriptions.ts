export type SkillGoalNode = {
	id: string;
	description: string | null;
	childIds: string[];
};

export function normalizeDescription(description: string | null | undefined): string | null {
	const trimmed = description?.trim();
	return trimmed ? trimmed : null;
}

/**
 * Returns the distinct descriptions of the given skills. With expandChildren, skills without
 * a description are replaced by the descriptions of their children (recursive, cycle-safe).
 */
export function collectSkillDescriptions(
	rootIds: string[],
	skills: ReadonlyMap<string, SkillGoalNode>,
	expandChildren: boolean
): string[] {
	const visited = new Set<string>();
	const goals = new Set<string>();

	const visit = (skillId: string) => {
		if (visited.has(skillId)) return;
		visited.add(skillId);

		const skill = skills.get(skillId);
		if (!skill) return;

		const description = normalizeDescription(skill.description);
		if (description) {
			goals.add(description);
		} else if (expandChildren) {
			skill.childIds.forEach(visit);
		}
	};

	rootIds.forEach(visit);
	return Array.from(goals);
}
