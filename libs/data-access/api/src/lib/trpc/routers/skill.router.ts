import { t, authorProcedure } from "../trpc";
import * as z from "zod";
import { database } from "@self-learning/database";
import { skillCreationFormSchema, skillRepositoryCreationSchema } from "@self-learning/types";

//TODO: SECURITY: Check if user is allowed to do this

export const skillRouter = t.router({
	getRepsFromUser: authorProcedure.query(async ({ ctx }) => {
		const { id: userId } = ctx.user;
		const repositories = await database.skillRepository.findMany({
			where: { id: userId }
		});
		return repositories;
	}),
	// getUnresolvedSkillsFromRepo: authorProcedure
	// 	.input(z.object({ id: z.string() }))
	// 	.query(async ({ input }) => {
	// 		return await skillServiceApi.SkillMgmtController_loadRepository({
	// 			params: { repositoryId: input.id }
	// 		});
	// 	}),
	addRepo: authorProcedure
		.input(z.object({ rep: skillRepositoryCreationSchema }))
		.mutation(async ({ input }) => {
			return await database.skillRepository.create({
				data: { ...input.rep }
			});
		}),
	changeRepo: authorProcedure
		.input(
			z.object({
				repoId: z.string(),
				rep: skillRepositoryCreationSchema
			})
		)
		.mutation(async ({ input }) => {
			return await database.skillRepository.update({
				where: { id: input.repoId },
				data: { ...input.rep }
			});
		}),
	// getSkillFromId: authorProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {

	// 	return await skillServiceApi.SkillMgmtController_getSkill({
	// 		params: { skillId: input.id }
	// 	});
	// }),
	// getSkillsFromIdArray: authorProcedure
	// 	.input(z.object({ ids: z.array(z.string()) }))
	// 	.query(async ({ input }) => {
	// 		const skills = [];
	// 		for (const id of input.ids) {
	// 			skills.push(
	// 				await skillServiceApi.SkillMgmtController_getSkill({ params: { skillId: id } })
	// 			);
	// 		}
	// 		return skills;
	// 	}),
	// changeSkillById: authorProcedure
	// 	.input(
	// 		z.object({
	// 			repoId: z.string(),
	// 			skill: SkillServiceZodSchemas.SkillCreationDto
	// 		})
	// 	)
	// 	.mutation(async ({ input }) => {
	// 		return await skillServiceApi.SkillMgmtController_adaptSkill(
	// 			{ ...input.skill },
	// 			{ params: { repositoryId: input.repoId } }
	// 		);
	// 	}),
	createSkill: authorProcedure
		.input(
			z.object({
				repId: z.string(),
				skill: skillCreationFormSchema
			})
		)
		.mutation(async ({ input }) => {
			// check for cycles in the graph
			// const pathPlanner = new PathPlanner();
			// const isAcyclic = await pathPlanner.isAcyclic(input.skill);
			// if (!isAcyclic) {
			// 	throw new Error("The graph is not acyclic.");
			// }
			return await database.skill.create({
				data: {
					...input.skill,
					repository: { connect: { id: input.repId } }
				}
			});
		})
	// deleteSkill: authorProcedure.input(z.object({
	// 	id: z.string() })).mutation( async({ input }) => {
	// 		// return await skillServiceApi.SkillMgmtController_deleteSkill( { params: { skillId: input.id } });
	// })
});
