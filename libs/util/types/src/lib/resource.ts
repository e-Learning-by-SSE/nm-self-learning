import { AccessLevel } from "@prisma/client";
import { z } from "zod";
import { AccessLevelEnum } from "./permissions";

// === for backend (ResourceInput & ResourceAccess)

export const ResourceInputSchema = z
	.object({
		courseId: z.string().nullish(),
		lessonId: z.string().nullish(),
		specializationId: z.string().nullish(),
		subjectId: z.string().nullish()
	})
	.refine(
		p => {
			const resources = [p.courseId, p.lessonId, p.specializationId, p.subjectId];
			const providedResources = resources.filter(Boolean);
			return providedResources.length === 1;
		},
		{
			message: "Exactly one resource must be provided"
		}
	)
	.transform(data => {
		if (data.courseId) return { courseId: data.courseId };
		if (data.lessonId) return { lessonId: data.lessonId };
		if (data.specializationId) return { specializationId: data.specializationId };
		if (data.subjectId) return { subjectId: data.subjectId };
		throw new Error("Invalid resource input");
	});
export type ResourceInput = z.infer<typeof ResourceInputSchema>;

export const ResourceAccessSchema = z
	.object({
		courseId: z.string().nullish(),
		lessonId: z.string().nullish(),
		specializationId: z.string().nullish(),
		subjectId: z.string().nullish(),
		accessLevel: AccessLevelEnum
	})
	.refine(
		p => {
			const resources = [p.courseId, p.lessonId, p.specializationId, p.subjectId];
			const providedResources = resources.filter(Boolean);
			return providedResources.length === 1;
		},
		{
			message: "Exactly one resource must be provided"
		}
	)
	.transform(data => {
		if (data.courseId) return { courseId: data.courseId, accessLevel: data.accessLevel };
		if (data.lessonId) return { lessonId: data.lessonId, accessLevel: data.accessLevel };
		if (data.specializationId)
			return { specializationId: data.specializationId, accessLevel: data.accessLevel };
		if (data.subjectId) return { subjectId: data.subjectId, accessLevel: data.accessLevel };
		throw new Error("Invalid resource input");
	});

export type ResourceAccess = z.infer<typeof ResourceAccessSchema>;

// === for groups ui
export const ResourceAccessFormSchema = z
	.object({
		accessLevel: AccessLevelEnum,
		course: z.object({ courseId: z.string(), slug: z.string(), title: z.string() }).nullish(),
		lesson: z.object({ lessonId: z.string(), slug: z.string(), title: z.string() }).nullish(),
		specialization: z
			.object({
				specializationId: z.string(),
				slug: z.string(),
				title: z.string()
			})
			.nullish(),
		subject: z.object({ subjectId: z.string(), slug: z.string(), title: z.string() }).nullish()
	})
	.refine(
		p => {
			const resources = [p.course, p.lesson, p.specialization, p.subject];
			const providedResources = resources.filter(Boolean);
			return providedResources.length === 1;
		},
		{
			message: "Exactly one resource must be provided"
		}
	);

export type ResourceAccessFormType = z.infer<typeof ResourceAccessFormSchema>;

//=== for resources ui (subjects, specializations, courses, lessons)

export const ResourcePermissionsFormSchema = z
	.object({
		accessLevel: z.enum(AccessLevel),
		groupId: z.number(),
		groupName: z.string()
	})
	.array()
	.refine(perms => perms.some(p => p.accessLevel === AccessLevel.FULL), {
		message: "At least one permission with FULL access level is required"
	});

export type ResourcePermissionsFormType = z.infer<typeof ResourcePermissionsFormSchema>;

// ===

export const ResourceKindEnum = z.enum(["course", "lesson", "specialization", "subject"]);
export type ResourceKind = z.infer<typeof ResourceKindEnum>;

export const allResourceKinds: ResourceKind[] = ["course", "lesson", "specialization", "subject"];

export const resourceLabels: Record<ResourceKind, string> = {
	course: "Kurs",
	lesson: "Lerneinheit",
	specialization: "Spezialisierung",
	subject: "Fachgebiet"
};

export const ResourceSearchEntrySchema = z.object({
	kind: ResourceKindEnum,
	id: z.string(),
	key: z.string(),
	title: z.string(),
	slug: z.string(),
	imgUrl: z.string().nullish(),
	accessLevel: z.enum(AccessLevel).optional()
});

export type ResourceSearchEntry = z.infer<typeof ResourceSearchEntrySchema>;

export const ResourceSearchInputSchema = z.object({
	page: z.number().positive(),
	title: z.string().optional(),
	kinds: ResourceKindEnum.array().optional()
});

export type ResourceSearchInput = z.infer<typeof ResourceSearchInputSchema>;

export type NormalizedResourceAccess = {
	kind: ResourceKind;
	type: string;
	id: string;
	key: string;
	title: string;
	slug: string;
	accessLevel: AccessLevel;
};

export function getResourceSearchEntryKey(
	resource: Pick<ResourceSearchEntry, "kind" | "id">
): string {
	return `${resource.kind}:${resource.id}`;
}

export function getResourceAccessFormKey(permission: ResourceAccessFormType): string {
	return normalizeFormResourceAccess(permission).key;
}

export function toResourceAccessForm(
	resource: ResourceSearchEntry,
	accessLevel: AccessLevel = AccessLevel.FULL
): ResourceAccessFormType {
	switch (resource.kind) {
		case "course":
			return {
				accessLevel,
				course: { courseId: resource.id, slug: resource.slug, title: resource.title }
			};
		case "lesson":
			return {
				accessLevel,
				lesson: { lessonId: resource.id, slug: resource.slug, title: resource.title }
			};
		case "specialization":
			return {
				accessLevel,
				specialization: {
					specializationId: resource.id,
					slug: resource.slug,
					title: resource.title
				}
			};
		case "subject":
			return {
				accessLevel,
				subject: { subjectId: resource.id, slug: resource.slug, title: resource.title }
			};
	}
}

export function stripFormResourceAccess(data: ResourceAccessFormType): ResourceAccess {
	const { accessLevel, course, lesson, specialization, subject } = data;

	if (course) return { accessLevel, courseId: course.courseId };
	if (lesson) return { accessLevel, lessonId: lesson.lessonId };
	if (specialization) return { accessLevel, specializationId: specialization.specializationId };
	if (subject) return { accessLevel, subjectId: subject.subjectId };

	throw new Error("Invalid resource input");
}

export function normalizeFormResourceAccess(
	permission: ResourceAccessFormType
): NormalizedResourceAccess {
	if (permission.course) {
		const id = permission.course.courseId;
		const kind = "course";
		return {
			kind,
			type: resourceLabels[kind],
			id,
			key: getResourceSearchEntryKey({ kind, id }),
			title: permission.course.title,
			slug: permission.course.slug,
			accessLevel: permission.accessLevel
		};
	}
	if (permission.lesson) {
		const id = permission.lesson.lessonId;
		const kind = "lesson";
		return {
			kind,
			type: resourceLabels[kind],
			id,
			key: getResourceSearchEntryKey({ kind, id }),
			title: permission.lesson.title,
			slug: permission.lesson.slug,
			accessLevel: permission.accessLevel
		};
	}
	if (permission.specialization) {
		const id = permission.specialization.specializationId;
		const kind = "specialization";
		return {
			kind,
			type: resourceLabels[kind],
			id,
			key: getResourceSearchEntryKey({ kind, id }),
			title: permission.specialization.title,
			slug: permission.specialization.slug,
			accessLevel: permission.accessLevel
		};
	}
	if (permission.subject) {
		const id = permission.subject.subjectId;
		const kind = "subject";
		return {
			kind,
			type: resourceLabels[kind],
			id,
			key: getResourceSearchEntryKey({ kind, id }),
			title: permission.subject.title,
			slug: permission.subject.slug,
			accessLevel: permission.accessLevel
		};
	}
	throw new Error("Invalid resource input");
}
