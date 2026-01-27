import { AccessLevel } from "@prisma/client";
import { UserFromSession } from "../trpc/context";
import { hasResourceAccess } from "./permission.service";
import { database } from "@self-learning/database";

export async function canEdit(user: UserFromSession, lessonId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, lessonId, accessLevel: AccessLevel.EDIT });
}

export async function canDelete(user: UserFromSession, lessonId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, lessonId, accessLevel: AccessLevel.FULL });
}

// any group user can create lessons
export async function canCreate(user: UserFromSession): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	const canCreate = await database.member.findFirst({
		where: {
			userId: user.id
		},
		select: { userId: true } // do not select unnecessary data
	});
	return !!canCreate;
}
