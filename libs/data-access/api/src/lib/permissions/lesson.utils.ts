import { AccessLevel } from "@prisma/client";
import { UserFromSession } from "../trpc/context";
import { hasResourceAccess } from "./permission.service";

export async function canEdit(user: UserFromSession, lessonId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, lessonId, accessLevel: AccessLevel.EDIT });
}
