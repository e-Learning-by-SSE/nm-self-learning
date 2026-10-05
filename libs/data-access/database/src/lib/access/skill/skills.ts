import { ResolvedValue } from "@self-learning/types";
import { database } from "../../prisma";

export function getSkillById(id: string) {
	return database.skill.findUnique({
		where: { id },
		include: {
			children: true,
			parents: true,
			// Same shape as resourcePermissionSelect.
			permissions: {
				select: {
					accessLevel: true,
					group: { select: { id: true, name: true } }
				}
			}
		}
	});
}

export type SkillResolved = ResolvedValue<typeof getSkillById>;
