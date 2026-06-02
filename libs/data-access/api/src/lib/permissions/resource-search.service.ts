import { AccessLevel, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	allResourceKinds,
	getResourceSearchEntryKey,
	greaterAccessLevel,
	ResourceKind,
	ResourceSearchEntry,
	ResourceSearchInput
} from "@self-learning/types";
import { paginate, Paginated } from "@self-learning/util/common";
import { getActiveMembershipWhere } from "./permission.service";

/**
 * AI-generated content.
 *
 * Resource search service.
 *
 * Replaces the duplicated inline resource search code from `permission.router.ts`.
 * Use `searchResources` for global admin/resource picker search and `getMyResources`
 * for resources reachable through a user's active group memberships.
 *
 * Resource-specific differences are kept in `resourceSearch`; pagination, title
 * filtering, key creation, active-membership filtering, and best-access aggregation
 * are shared by all resource kinds.
 */

const pageSize = 15;

type ResourceInfo = {
	id: string;
	slug: string;
	title: string;
	imgUrl?: string | null;
};

type TitleFilter = ReturnType<typeof getTitleFilter>;

type PermissionResourceRow = {
	accessLevel: AccessLevel;
	course: { courseId: string; slug: string; title: string; imgUrl: string | null } | null;
	lesson: { lessonId: string; slug: string; title: string; imgUrl: string | null } | null;
	specialization: {
		specializationId: string;
		slug: string;
		title: string;
		cardImgUrl: string | null;
	} | null;
	subject: { subjectId: string; slug: string; title: string; cardImgUrl: string | null } | null;
};

type ResourceSearchConfig = {
	findAll: (title: TitleFilter) => Promise<ResourceSearchEntry[]>;
	permissionWhere: (title: TitleFilter) => Prisma.PermissionWhereInput;
	fromPermission: (permission: PermissionResourceRow) => ResourceSearchEntry | null;
};

function getTitleFilter(title?: string) {
	const value = title?.trim();
	return value ? { contains: value, mode: "insensitive" as const } : undefined;
}

function getSelectedKinds(input: ResourceSearchInput): ResourceKind[] {
	return input.kinds?.length ? input.kinds : allResourceKinds;
}

function toResourceEntry(
	kind: ResourceKind,
	resource: ResourceInfo,
	accessLevel?: AccessLevel
): ResourceSearchEntry {
	return {
		kind,
		id: resource.id,
		key: getResourceSearchEntryKey({ kind, id: resource.id }),
		title: resource.title,
		slug: resource.slug,
		imgUrl: resource.imgUrl,
		accessLevel
	};
}

function paginateResources(
	resources: ResourceSearchEntry[],
	input: ResourceSearchInput
): Paginated<ResourceSearchEntry> {
	const sortedResources = resources.sort((left, right) => {
		const titleComparison = left.title.localeCompare(right.title);
		return titleComparison !== 0 ? titleComparison : left.kind.localeCompare(right.kind);
	});
	const { skip, take } = paginate(pageSize, input.page);

	return {
		result: sortedResources.slice(skip, skip + take),
		pageSize,
		page: input.page,
		totalCount: resources.length
	};
}

function aggregateBestResourceAccess(resources: ResourceSearchEntry[]): ResourceSearchEntry[] {
	const entries = new Map<string, ResourceSearchEntry>();

	for (const resource of resources) {
		const existing = entries.get(resource.key);
		if (
			!existing ||
			(resource.accessLevel &&
				(!existing.accessLevel ||
					greaterAccessLevel(resource.accessLevel, existing.accessLevel)))
		) {
			entries.set(resource.key, resource);
		}
	}

	return Array.from(entries.values());
}

const resourceSearch: Record<ResourceKind, ResourceSearchConfig> = {
	course: {
		findAll: async title => {
			const courses = await database.course.findMany({
				where: { title },
				select: { courseId: true, slug: true, title: true, imgUrl: true }
			});
			return courses.map(course =>
				toResourceEntry("course", {
					id: course.courseId,
					slug: course.slug,
					title: course.title,
					imgUrl: course.imgUrl
				})
			);
		},
		permissionWhere: title => (title ? { course: { title } } : { courseId: { not: null } }),
		fromPermission: permission =>
			permission.course
				? toResourceEntry(
						"course",
						{
							id: permission.course.courseId,
							slug: permission.course.slug,
							title: permission.course.title,
							imgUrl: permission.course.imgUrl
						},
						permission.accessLevel
					)
				: null
	},
	lesson: {
		findAll: async title => {
			const lessons = await database.lesson.findMany({
				where: { title },
				select: { lessonId: true, slug: true, title: true, imgUrl: true }
			});
			return lessons.map(lesson =>
				toResourceEntry("lesson", {
					id: lesson.lessonId,
					slug: lesson.slug,
					title: lesson.title,
					imgUrl: lesson.imgUrl
				})
			);
		},
		permissionWhere: title => (title ? { lesson: { title } } : { lessonId: { not: null } }),
		fromPermission: permission =>
			permission.lesson
				? toResourceEntry(
						"lesson",
						{
							id: permission.lesson.lessonId,
							slug: permission.lesson.slug,
							title: permission.lesson.title,
							imgUrl: permission.lesson.imgUrl
						},
						permission.accessLevel
					)
				: null
	},
	specialization: {
		findAll: async title => {
			const specializations = await database.specialization.findMany({
				where: { title },
				select: { specializationId: true, slug: true, title: true, cardImgUrl: true }
			});
			return specializations.map(specialization =>
				toResourceEntry("specialization", {
					id: specialization.specializationId,
					slug: specialization.slug,
					title: specialization.title,
					imgUrl: specialization.cardImgUrl
				})
			);
		},
		permissionWhere: title =>
			title ? { specialization: { title } } : { specializationId: { not: null } },
		fromPermission: permission =>
			permission.specialization
				? toResourceEntry(
						"specialization",
						{
							id: permission.specialization.specializationId,
							slug: permission.specialization.slug,
							title: permission.specialization.title,
							imgUrl: permission.specialization.cardImgUrl
						},
						permission.accessLevel
					)
				: null
	},
	subject: {
		findAll: async title => {
			const subjects = await database.subject.findMany({
				where: { title },
				select: { subjectId: true, slug: true, title: true, cardImgUrl: true }
			});
			return subjects.map(subject =>
				toResourceEntry("subject", {
					id: subject.subjectId,
					slug: subject.slug,
					title: subject.title,
					imgUrl: subject.cardImgUrl
				})
			);
		},
		permissionWhere: title => (title ? { subject: { title } } : { subjectId: { not: null } }),
		fromPermission: permission =>
			permission.subject
				? toResourceEntry(
						"subject",
						{
							id: permission.subject.subjectId,
							slug: permission.subject.slug,
							title: permission.subject.title,
							imgUrl: permission.subject.cardImgUrl
						},
						permission.accessLevel
					)
				: null
	}
};

export async function searchAllResources(
	input: ResourceSearchInput
): Promise<Paginated<ResourceSearchEntry>> {
	const title = getTitleFilter(input.title);
	const searches = getSelectedKinds(input).map(kind => resourceSearch[kind].findAll(title));
	const resources = (await Promise.all(searches)).flat();

	return paginateResources(resources, input);
}

export async function searchMyResources(
	userId: string,
	input: ResourceSearchInput
): Promise<Paginated<ResourceSearchEntry>> {
	const title = getTitleFilter(input.title);
	const selectedKinds = getSelectedKinds(input);
	const permissionFilters = selectedKinds.map(kind =>
		resourceSearch[kind].permissionWhere(title)
	);

	if (permissionFilters.length === 0) {
		return paginateResources([], input);
	}

	const permissions = await database.permission.findMany({
		where: {
			OR: permissionFilters,
			group: {
				members: {
					some: getActiveMembershipWhere(userId)
				}
			}
		},
		select: {
			accessLevel: true,
			course: { select: { courseId: true, slug: true, title: true, imgUrl: true } },
			lesson: { select: { lessonId: true, slug: true, title: true, imgUrl: true } },
			specialization: {
				select: { specializationId: true, slug: true, title: true, cardImgUrl: true }
			},
			subject: { select: { subjectId: true, slug: true, title: true, cardImgUrl: true } }
		}
	});
	const resources = permissions.flatMap(permission => {
		for (const kind of selectedKinds) {
			const resource = resourceSearch[kind].fromPermission(permission);
			if (resource) return [resource];
		}
		return [];
	});

	return paginateResources(aggregateBestResourceAccess(resources), input);
}
