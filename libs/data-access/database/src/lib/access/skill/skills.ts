import { ResolvedValue } from "@self-learning/types";
import { database } from "../../prisma";

export function getSkillById(id: string) {
	return database.skill.findUnique({
		where: { id },
		include: {
			children: true,
			parents: true
		}
	});
}

export type SkillResolved = ResolvedValue<typeof getSkillById>;
