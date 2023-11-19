import {authorProcedure, t} from "../trpc";
import * as z from "zod";
import {database} from "@self-learning/database";
import {
	ResolvedValue,
	skillCreationFormSchema,
	skillFormSchema,
	skillRepositoryCreationSchema,
	skillRepositorySchema
} from "@self-learning/types";

export type SkillResolved = ResolvedValue<typeof getSkillById>;
export type SkillUnresolved = Omit<SkillResolved, "children" | "repository" | "parents">;

function getSkillById(id: string) {
	return database.skill.findUnique({
		where: {id},
		include: {
			children: true,
			repository: true,
			parents: true
		}
	});
}

export const skillRouter = t.router({
	getRepository: authorProcedure.input(z.object({id: z.string()})).query(async ({input}) => {
		return await database.skillRepository.findUnique({
			where: {id: input.id}
		});
	}),
	getRepositories: authorProcedure.query(async () => {
		return await database.skillRepository.findMany();
	}),
	getRepositoriesByUser: authorProcedure.query(async ({ctx}) => {
		const {id: userId} = ctx.user;
		const repositories = await database.skillRepository.findMany({
			where: {ownerId: userId}
		});
		return repositories;
	}),
	deleteRepository: authorProcedure
		.input(z.object({id: z.string()}))
		.mutation(async ({input}) => {
			return await database.skillRepository.delete({
				where: {id: input.id}
			});
		}),
	getSkillsWithoutParentFromRepo: authorProcedure
		.input(z.object({repoId: z.string()}))
		.query(async ({input}) => {
			return await database.skill.findMany({
				where: {repositoryId: input.repoId, parents: {none: {}}}
			});
		}),
	getUnresolvedSkillsFromRepo: authorProcedure
		.input(z.object({repoId: z.string()}))
		.query(async ({input}) => {
			return await database.skill.findMany({
				where: {repositoryId: input.repoId}
			});
		}),
	addRepo: authorProcedure
		.input(z.object({rep: skillRepositoryCreationSchema}))
		.mutation(async ({input}) => {
			return await database.skillRepository.create({
				data: {...input.rep}
			});
		}),
	updateRepo: authorProcedure
		.input(
			z.object({
				repoId: z.string(),
				rep: skillRepositorySchema
			})
		)
		.mutation(async ({input}) => {
			return await database.skillRepository.update({
				where: {id: input.repoId},
				data: {...input.rep}
			});
		}),
	updateSkill: authorProcedure
		.input(
			z.object({
				skill: skillFormSchema
			})
		)
		.mutation(async ({input}) => {
			const children = input.skill.children.map(id => ({id}));
			const parents = input.skill.parents.map(id => ({id}));
			return await database.skill.update({
				where: {id: input.skill.id},
				data: {
					name: input.skill.name,
					description: input.skill.description,
					children: {set: children},
					parents: {set: parents},
					repository: {connect: {id: input.skill.repositoryId}}
				},
				include: {
					children: true,
					repository: true,
					parents: true
				}
			});
		}),

	createSkill: authorProcedure
		.input(
			z.object({
				repId: z.string(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({input}) => {
			return await database.skill.create({
				data: {
					...input.skill,
					repository: {connect: {id: input.repId}},
					children: {
						connect: input.skill.children.map(id => ({id}))
					}
				},
				include: {
					children: true,
					repository: true,
					parents: true
				}
			});
		}),

	getSkillById: authorProcedure
		.input(
			z.object({
				skillId: z.string()
			})
		)
		.query(async ({input}) => {
			return getSkillById(input.skillId);
		}),
	// getResolvedSkill: authorProcedure
	// 	.input(
	// 		z.object({
	// 			skillId: z.string()
	// 		})
	// 	)
	// 	.query(async ({ input }) => {
	// 		return await database.skill.findUnique({
	// 			where: { id: input.skillId },
	// 			include: {
	// 				children: true
	// 			}
	// 		});
	// 	})

	deleteSkill: authorProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({input}) => {
			// TODO decide what to do with children
			return await database.skill.delete({
				where: {id: input.id}
			});
		})
});
