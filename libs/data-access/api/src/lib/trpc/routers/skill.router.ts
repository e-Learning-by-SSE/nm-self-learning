import { authorProcedure, t } from "../trpc";
import * as z from "zod";
import { database, getSkillById } from "@self-learning/database";
import {
	createSkillFormModelFromSkillResolved,
	skillCreationFormSchema,
	SkillFormModel,
	skillFormSchema,
	skillRepositoryCreationSchema,
	skillRepositorySchema
} from "@self-learning/types";

async function updateSkill(skill: SkillFormModel) {
	const children = skill.children.map(id => ({ id }));
	const parents = skill.parents.map(id => ({ id }));

	return await database.skill.update({
		where: { id: skill.id },
		data: {
			name: skill.name,
			description: skill.description,
			children: { set: children },
			parents: { set: parents },
			repository: { connect: { id: skill.repositoryId } }
		},
		include: {
			children: true,
			repository: true,
			parents: true
		}
	});
}

async function createSkill(input: {
	skill: { children: string[]; name: string; description: string | null };
	repoId: string;
}) {
	return await database.skill.create({
		data: {
			...input.skill,
			repository: { connect: { id: input.repoId } },
			children: {
				connect: input.skill.children.map(id => ({ id }))
			}
		},
		include: {
			children: true,
			repository: true,
			parents: true
		}
	});
}

export async function getSkills(repoId: string) {
	const skills = await database.skill.findMany({
		where: { repositoryId: repoId },
		select: {
			id: true,
			name: true,
			description: true,
			repositoryId: true,
			children: { select: { id: true } },
			parents: { select: { id: true } },
			repository: true
		}
	});

	const transformedSkill = skills.map(skill => {
		return {
			id: skill.id,
			name: skill.name,
			description: skill.description,
			repositoryId: skill.repositoryId,
			children: skill.children.map(child => child.id),
			parents: skill.parents.map(parent => parent.id)
		};
	});
	return transformedSkill;
}

export const skillRouter = t.router({
	getRepositories: authorProcedure.query(async () => {
		return await database.skillRepository.findMany();
	}),
	getRepositoriesByUser: authorProcedure.query(async ({ ctx }) => {
		const { id: userId } = ctx.user;
		const repositories = await database.skillRepository.findMany({
			where: { ownerName: userId }
		});
		return repositories;
	}),
	addRepo: authorProcedure
		.input(z.object({ rep: skillRepositoryCreationSchema }))
		.mutation(async ({ input, ctx }) => {
			return await database.skillRepository.create({
				data: { ...input.rep, ownerName: ctx.user.name }
			});
		}),
	deleteRepository: authorProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			return await database.skillRepository.delete({
				where: { id: input.id }
			});
		}),
	updateRepo: authorProcedure
		.input(
			z.object({
				repoId: z.string(),
				rep: skillRepositorySchema
			})
		)
		.mutation(async ({ input }) => {
			return await database.skillRepository.update({
				where: { id: input.repoId },
				data: { ...input.rep }
			});
		}),
	getUnresolvedSkillsFromRepo: authorProcedure
		.input(z.object({ repoId: z.string() }))
		.query(async ({ input }) => {
			return await database.skill.findMany({
				where: { repositoryId: input.repoId }
			});
		}),
	getSkillsFromRepository: authorProcedure
		.input(
			z.object({
				repoId: z.string()
			})
		)
		.query(async ({ input }) => {
			return await getSkills(input.repoId);
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
				parentSkillId: z.string(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({ input }) => {
			const parentSkill = await getSkillById(input.parentSkillId);
			if (!parentSkill) return null;
			const createdSkill = await createSkill({
				repoId: input.repoId,
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
			return await database.skill.findMany({
				where: { id: { in: input.skillIds } },
				include: {
					children: true,
					repository: true,
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
			return await database.skill.deleteMany({
				where: { id: { in: input.ids } }
			});
		})
});
