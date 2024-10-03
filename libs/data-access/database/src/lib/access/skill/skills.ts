import { ResolvedValue } from "@self-learning/types";
import { database } from "../../prisma";

export function getSkillById(id: string) {
	return database.skill.findUnique({
		where: { id },
		include: {
			children: true,
			repository: true,
			parents: true
		}
	});
}

export type SkillResolved = ResolvedValue<typeof getSkillById>;
export type SkillUnresolved = Omit<SkillResolved, "children" | "repository" | "parents">;
