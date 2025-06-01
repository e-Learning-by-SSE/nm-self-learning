import { authorProcedure, t } from "../trpc";
import * as z from "zod";
import { database, getSkillById } from "@self-learning/database";
import {
	createSkillFormModelFromSkillResolved,
	skillCreationFormSchema,
	SkillFormModel,
	skillFormSchema
} from "@self-learning/types";
import fieldTypes from "rehype-citation/node/src/citation-js/plugin-bibtex/input/fieldTypes";

async function updateSkill(skill: SkillFormModel) {
	const children = skill.children.map(id => ({ id }));
	const parents = skill.parents.map(id => ({ id }));

	return database.skill.update({
		where: { id: skill.id },
		data: {
			name: skill.name,
			description: skill.description,
			children: { set: children },
			parents: { set: parents },
			author: { connect: { id: skill.authorId } }
		},
		include: {
			children: true,
			parents: true
		}
	});
}

async function createSkill(input: {
	skill: { children: string[]; name: string; description: string | null };
	repoId: string;
	authorId: number;
}) {
	return database.skill.create({
		data: {
			...input.skill,
			author: { connect: { id: input.authorId } },
			children: {
				connect: input.skill.children.map(id => ({ id }))
			}
		},
		include: {
			children: true,
			parents: true
		}
	});
}

export async function getParentSkills() {
	return database.skill.findMany({
		where: { parents: { none: {} } },
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

export async function getSkillsByAuthorId(authorId: number) {
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

	const transformedSkill = skills.map(skill => {
		return {
			id: skill.id,
			name: skill.name,
			description: skill.description,
			authorId: skill.authorId,
			children: skill.children.map(child => child.id),
			parents: skill.parents.map(parent => parent.id)
		};
	});
	return transformedSkill;
}

export const skillRouter = t.router({
	getParentSkills: authorProcedure.query(async () => {
		const skills = await database.skill.findMany({
			where: {
				parents: { none: {} }
			},
			select: {
				id: true,
				name: true,
				description: true,
				authorId: true,
				children: { select: { id: true } },
				parents: { select: { id: true } }
			}
		});

		const transformedSkills: SkillFormModel[] = skills.map(skill => ({
			name: skill.name,
			description: skill.description,
			id: skill.id,
			authorId: skill.authorId,
			children: skill.children.map(child => child.id),
			parents: skill.parents.map(parent => parent.id)
		}));

		return transformedSkills;
	}),
	getSkillsByAuthorId: authorProcedure.query(async ({ input, ctx }) => {
		const authorId = (
			await database.author.findUnique({
				where: { username: ctx.user.name },
				select: { id: true }
			})
		)?.id;

		return await getSkillsByAuthorId(authorId ? authorId : -1);
	}),
	updateSkill: authorProcedure
		.input(
			z.object({
				skill: skillFormSchema
			})
		)
		.mutation(async ({ input }) => {
			return updateSkill(input.skill);
		}),

	createSkill: authorProcedure
		.input(
			z.object({
				repoId: z.string(),
				authorId: z.number(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({ input }) => {
			return await createSkill(input);
		}),
	createSkillWithParents: authorProcedure
		.input(
			z.object({
				repoId: z.string(),
				authorId: z.number(),
				parentSkillId: z.string(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({ input }) => {
			const parentSkill = await getSkillById(input.parentSkillId);
			if (!parentSkill) return null;
			const createdSkill = await createSkill({
				repoId: input.repoId,
				authorId: input.authorId,
				skill: input.skill
			});
			const parentSkillFormModel = createSkillFormModelFromSkillResolved(parentSkill);
			const updatedParentSkill = await updateSkill({
				...parentSkillFormModel,
				children: [...parentSkillFormModel.children, createdSkill.id]
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

	deleteSkills: authorProcedure
		.input(
			z.object({
				ids: z.array(z.string())
			})
		)
		.mutation(async ({ input }) => {
			// TODO decide what to do with children
			return database.skill.deleteMany({
				where: { id: { in: input.ids } }
			});
		})
});
