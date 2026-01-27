import { database } from "@self-learning/database";
import { hasResourceAccess } from "./permission.service";
import { UserFromSession } from "../trpc/context";
import { AccessLevel } from "@prisma/client";

// TODO for now all can read
// async function canRead(user: UserFromSession, courseId: string): Promise<boolean> {
// 	if (user.role === "ADMIN") return true;
// 	return await hasAccessLevel(user, PermissionResourceEnum.Enum.SUBJECT, courseId, "VIEW");
// }

// async function canCreate(user: UserFromSession, groupId: number): Promise<boolean> {
// 	if (user.role === "ADMIN") return true;
// 	return await hasGroupRole(groupId, user.id, GroupRole.MEMBER);
// }

export async function getIdBySlug(slug: string) {
	const { courseId } = await database.course.findUniqueOrThrow({
		where: { slug },
		select: { courseId: true }
	});
	return courseId;
}

export async function canEdit(user: UserFromSession, courseId: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	return await hasResourceAccess({ userId: user.id, courseId, accessLevel: AccessLevel.EDIT });
}

export async function canEditBySlug(user: UserFromSession, slug: string): Promise<boolean> {
	if (user.role === "ADMIN") return true;
	const courseId = await getIdBySlug(slug);
	return await canEdit(user, courseId);
}
