/**
 * Resolves roots using the complete skill hierarchy. A root belongs to itself.
 * Shared descendants use the smallest root ID; rootless cycles remain unresolved.
 * Each reachable skill and its children are visited once, after sorting the roots.
 */
export function getTopLevelSkillIds(
	skills: readonly { id: string; children: readonly { id: string }[] }[]
): Map<string, string> {
	const skillsById = new Map(skills.map(skill => [skill.id, skill]));
	const childIds = new Set(skills.flatMap(skill => skill.children.map(child => child.id)));
	const roots = skills
		.filter(skill => !childIds.has(skill.id))
		.map(skill => skill.id)
		.sort();
	const rootIds = new Map<string, string>();

	for (const rootId of roots) {
		const pending = [rootId];
		while (pending.length > 0) {
			const id = pending.pop() as string;
			if (rootIds.has(id)) continue;
			const skill = skillsById.get(id);
			if (!skill) continue;
			rootIds.set(id, rootId);
			for (const child of skill.children) pending.push(child.id);
		}
	}

	return rootIds;
}
