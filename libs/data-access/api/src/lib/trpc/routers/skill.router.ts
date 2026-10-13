import { authorProcedure, t } from "../trpc";
import * as z from "zod";
import { database, getSkillById } from "@self-learning/database";
import {
	ResourceAccess,
	skillCreateSchema,
	skillEditSchema,
	SkillFormModel,
	toResourcePermissionsForm
} from "@self-learning/types";
import { TRPCError } from "@trpc/server";
import { AccessLevel, Prisma } from "@prisma/client";
import {
	canCreate,
	canEdit,
	hasEffectiveResourceAccessBatch,
	preparePermissionsForCreate,
	prepareResourceUpdate
} from "../../permissions/permission.service";

type RawSkill = {
	id: string;
	name: string;
	description: string | null;
	authorId: number;
	children: { id: string }[];
	parents: { id: string }[];
};

type TransformedSkill = {
	id: string;
	name: string;
	description: string | null;
	authorId: number;
	children: string[];
	parents: string[];
};

async function updateSkill(
	skill: SkillFormModel,
	permissions?: Prisma.SkillUpdateInput["permissions"]
) {
	const children = skill.children.map(id => ({ id }));
	const parents = skill.parents.map(id => ({ id }));

	return database.skill.update({
		where: { id: skill.id },
		data: {
			name: skill.name,
			description: skill.description,
			children: { set: children },
			parents: { set: parents },
			author: { connect: { id: skill.authorId } },
			permissions
		},
		include: {
			children: true,
			parents: true
		}
	});
}

async function createSkill(input: {
	skill: { children: string[]; name: string; description: string | null };
	authorId: number;
	permissions: Prisma.SkillCreateInput["permissions"];
}) {
	return database.skill.create({
		data: {
			name: input.skill.name,
			description: input.skill.description,
			author: { connect: { id: input.authorId } },
			children: {
				connect: input.skill.children.map(id => ({ id }))
			},
			permissions: input.permissions
		},
		include: {
			children: true,
			parents: true
		}
	});
}

async function getSkills() {
	return database.skill.findMany({
		select: {
			id: true,
			name: true,
			description: true,
			authorId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } }
		}
	});
}

async function getSkillsByAuthorId(authorId: number) {
	const skills = await database.skill.findMany({
		where: { authorId: authorId },
		select: {
			id: true,
			name: true,
			description: true,
			authorId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } }
		}
	});
	return transformSkills(skills);
}

async function getSkillUsage(skillIds: string[]) {
	const allSkills = await database.skill.findMany({
		select: {
			id: true,
			name: true,
			children: { select: { id: true } }
		}
	});
	const skillsById = new Map(allSkills.map(skill => [skill.id, skill]));
	const relevantSkillIds = new Set(skillIds);
	const pendingSkillIds = [...skillIds];

	while (pendingSkillIds.length > 0) {
		const skillId = pendingSkillIds.pop();
		if (!skillId) continue;

		for (const child of skillsById.get(skillId)?.children ?? []) {
			if (!relevantSkillIds.has(child.id)) {
				relevantSkillIds.add(child.id);
				pendingSkillIds.push(child.id);
			}
		}
	}

	const relevantIds = [...relevantSkillIds];
	const [courses, lessons] = await Promise.all([
		database.course.findMany({
			where: {
				OR: [
					{ requires: { some: { id: { in: relevantIds } } } },
					{ provides: { some: { id: { in: relevantIds } } } }
				]
			},
			orderBy: { title: "asc" },
			select: {
				courseId: true,
				slug: true,
				title: true,
				requires: { select: { id: true, name: true } },
				provides: { select: { id: true, name: true } }
			}
		}),
		database.lesson.findMany({
			where: {
				OR: [
					{ requires: { some: { id: { in: relevantIds } } } },
					{ provides: { some: { id: { in: relevantIds } } } }
				]
			},
			orderBy: { title: "asc" },
			select: {
				lessonId: true,
				slug: true,
				title: true,
				requires: { select: { id: true, name: true } },
				provides: { select: { id: true, name: true } }
			}
		})
	]);

	const getUsedSkillNames = (
		requires: { id: string; name: string }[],
		provides: { id: string; name: string }[]
	) => [
		...new Map(
			[...requires, ...provides]
				.filter(skill => relevantSkillIds.has(skill.id))
				.map(skill => [skill.id, skill.name])
		).values()
	];

	return {
		courses: courses.map(course => ({
			id: course.courseId,
			slug: course.slug,
			title: course.title,
			skills: getUsedSkillNames(course.requires, course.provides)
		})),
		lessons: lessons.map(lesson => ({
			id: lesson.lessonId,
			slug: lesson.slug,
			title: lesson.title,
			skills: getUsedSkillNames(lesson.requires, lesson.provides)
		}))
	};
}

function transformSkills(skills: RawSkill[]): TransformedSkill[] {
	return skills.map(skill => ({
		id: skill.id,
		name: skill.name,
		description: skill.description,
		authorId: skill.authorId,
		children: skill.children.map(child => child.id),
		parents: skill.parents.map(parent => parent.id)
	}));
}

export const skillRouter = t.router({
	getSkills: authorProcedure.query(async () => {
		return transformSkills(await getSkills());
	}),
	getSkillsByAuthorId: authorProcedure.query(async ({ ctx }) => {
		const authorId = (
			await database.author.findUnique({
				where: { username: ctx.user.name },
				select: { id: true }
			})
		)?.id;

		return await getSkillsByAuthorId(authorId ? authorId : -1);
	}),
	// TODO use getMyResources or create a separate method for any user
	// getParentSkillsByAuthorId - removed
	updateSkill: authorProcedure
		.input(
			z.object({
				skill: skillEditSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { permissions: formPermissions, ...skill } = input.skill;
			// diff parents (must have EDIT)
			const oldSkill = await getSkillById(skill.id);
			if (!oldSkill) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Skill not found." });
			}
			const oldParents = new Set(oldSkill.parents.map(p => p.id));
			const newParents = new Set(skill.parents);
			// A.symmetricDifference(B)
			const symmetricDiff = [
				...[...oldParents].filter(x => !newParents.has(x)),
				...[...newParents].filter(x => !oldParents.has(x))
			];
			const checks = symmetricDiff.map(skillId => ({
				skillId,
				accessLevel: AccessLevel.EDIT
			}));
			const canUpdate = await hasEffectiveResourceAccessBatch(ctx.user, checks);
			if (!canUpdate) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			const permissions = await prepareResourceUpdate(
				ctx.user,
				{ skillId: skill.id },
				formPermissions
			);
			return updateSkill(skill, permissions);
		}),

	createSkill: authorProcedure
		.input(
			z.object({
				authorId: z.number(),
				skill: skillCreateSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!(await canCreate(ctx.user))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			const { permissions: formPermissions, ...skill } = input.skill;
			const permissions = await preparePermissionsForCreate(formPermissions);
			return await createSkill({ authorId: input.authorId, skill, permissions });
		}),
	createSkillWithParents: authorProcedure
		.input(
			z.object({
				authorId: z.number(),
				parentSkillId: z.string(),
				// permissions are copied from parent skill
				skill: skillCreateSchema.omit({ permissions: true })
			})
		)
		.mutation(async ({ ctx, input }) => {
			const parentSkill = await getSkillById(input.parentSkillId);
			if (!parentSkill) return null;
			if (!(await canCreate(ctx.user))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			if (!(await canEdit(ctx.user, { skillId: input.parentSkillId }))) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			// The child starts with a copy of the parent's rows.
			const permissions = await preparePermissionsForCreate(
				toResourcePermissionsForm(parentSkill.permissions)
			);
			const createdSkill = await createSkill({
				authorId: input.authorId,
				skill: input.skill,
				permissions
			});
			const updatedParentSkill = await database.skill.update({
				where: { id: parentSkill.id },
				data: { children: { connect: { id: createdSkill.id } } },
				include: { children: true, parents: true }
			});
			return { parentSkill: updatedParentSkill, createdSkill };
		}),

	getSkillById: authorProcedure
		.input(
			z.object({
				skillId: z.string()
			})
		)
		.query(async ({ input }) => {
			return getSkillById(input.skillId);
		}),

	getSkillsByIds: authorProcedure
		.input(
			z.object({
				skillIds: z.array(z.string())
			})
		)
		.mutation(async ({ input }) => {
			return database.skill.findMany({
				where: { id: { in: input.skillIds } },
				include: {
					children: true,
					parents: true
				}
			});
		}),
	getDeleteUsage: authorProcedure
		.input(z.object({ skillId: z.string() }))
		.query(async ({ input }) => getSkillUsage([input.skillId])),

	deleteSkills: authorProcedure
		.input(
			z.object({
				ids: z.array(z.string())
			})
		)
		.mutation(async ({ input, ctx }) => {
			// test permission for each skill
			const checks: ResourceAccess[] = input.ids.map(skillId => ({
				skillId,
				accessLevel: AccessLevel.FULL // canDelete required FULL
			}));
			// TODO returns no feedback
			const canDelete = await hasEffectiveResourceAccessBatch(ctx.user, checks);
			if (!canDelete) {
				throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
			}
			const usage = await getSkillUsage(input.ids);
			if (usage.courses.length > 0 || usage.lessons.length > 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "The skill or one of its children is still in use."
				});
			}
			return database.skill.deleteMany({
				where: { id: { in: input.ids } }
			});
		})
});
