import { t ,authorProcedure } from "../trpc";
import * as z from "zod";
impo { SkillService } from "@self-learning/competence-rep";
import { skillCreationDtoSchema } from "libs/data-access/openapi-client/src/models/SkillCreationDto";
import { skillRepositoryCreationDtoSchema } from "libs/data-access/openapi-client/src/models/SkillRepositoryCreationDto";
import { skillRepositoryDtoSchema } from "libs/data-access/openapi-client/src/models/SkillRepositoryDto";

//TODO: SECURITY: Check if user is allowed to do this
const skillServiceApi = createApiClient("http://localhost:3333/api");

export const skillRouter = t.router({
	getRepsFromUser: authorProcedure.query(async ({ ctx }) => {
		return (await SkillService.skillMgmtControllerListRepositories(ctx.user.id)).repositories;
	}),
	getUnresolvedSkillsFromRepo: authorProcedure.input(
		z.object({ id: z.string() }))
		.query( async({ input }) => {
		return await skillServiceApi.SkillMgmtController_loadRepository( { params: { repositoryId: input.id } });
	}),
	addRepo: authorProcedure.input(
		z.object({ rep: SkillServiceZodSchemas.SkillRepositoryCreationDto }))
		.mutation( async({ input }) => {
			return await skillServiceApi.SkillMgmtController_createRepository( { ...input.rep } );
	}),
	changeRepo: authorProcedure.input(
		z.object({ 
			repoId : z.string(),
			rep: skillRepositoryDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerAdaptRepo(input.repoId, input.rep);
	}),
	getSkillFromId: authorProcedure.input(
		z.object({ id: z.string() }))
		.query( async({ input }) => {
			return await skillServiceApi.SkillMgmtController_getSkill( { params: { skillId: input.id } });
	}),
	getSkillsFromIdArray: authorProcedure.input(
		z.object({ ids: z.array(z.string()) }))
		.query( async({ input }) => {
		const skills = [];
		for (const id of input.ids) {
			skills.push(await skillServiceApi.SkillMgmtController_getSkill( { params: { skillId: id } }));
		}
		return skills;
	}),
	changeSkillById: authorProcedure.input(z.object({ 
		repoId: z.string(), 
		skill: SkillServiceZodSchemas.SkillCreationDto }))
		.mutation( async({ input }) => {
			return await skillServiceApi.SkillMgmtController_adaptSkill( { ...input.skill }, { params: { repositoryId: input.repoId } } );
	}),
	createSkill: authorProcedure.input(z.object({ 
		repId: z.string(), 
		skill: SkillServiceZodSchemas.SkillCreationDto }))
		.mutation( async({ input }) => {
			return await skillServiceApi.SkillMgmtController_addSkill( { ...input.skill }, { params: { repositoryId: input.repId } });
	}),
	// deleteSkill: authorProcedure.input(z.object({ 
	// 	id: z.string() })).mutation( async({ input }) => {
	// 		// return await skillServiceApi.SkillMgmtController_deleteSkill( { params: { skillId: input.id } });
	// })

});
