import { t ,authorProcedure } from "../trpc";
import * as z from "zod";
import { SkillService } from "@self-learning/competence-rep";
import { skillCreationDtoSchema } from "libs/data-access/openapi-client/src/models/SkillCreationDto";
import { skillRepositoryCreationDtoSchema } from "libs/data-access/openapi-client/src/models/SkillRepositoryCreationDto";
import { skillRepositoryDtoSchema } from "libs/data-access/openapi-client/src/models/SkillRepositoryDto";

//TODO: SECURITY: Check if user is allowed to do this

export const skillRouter = t.router({
	getRepsFromUser: authorProcedure.query(async ({ ctx }) => {
		return (await SkillService.skillMgmtControllerListRepositories(ctx.user.id)).repositories;
	}),
	getUnresolvedSkillsFromRepo: authorProcedure.input(
		z.object({ id: z.string() }))
		.query( async({ input }) => {
		return await SkillService.skillMgmtControllerLoadRepository(input.id);
	}),
	addRepo: authorProcedure.input(
		z.object({ rep: skillRepositoryCreationDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerCreateRepository(input.rep);
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
		return await SkillService.skillMgmtControllerGetSkill(input.id);
	}),
	getSkillsFromIdArray: authorProcedure.input(
		z.object({ ids: z.array(z.string()) }))
		.query( async({ input }) => {
		const skills = [];
		for (const id of input.ids) {
			skills.push(await SkillService.skillMgmtControllerGetSkill(id));
		}
		return skills;
	}),
	changeSkillById: authorProcedure.input(z.object({ 
		repoId: z.string(), 
		skill: skillCreationDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerAdaptSkill(input.repoId, input.skill);
	}),
	createSkill: authorProcedure.input(z.object({ 
		repId: z.string(), 
		skill: skillCreationDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerAddSkill(input.repId, input.skill);
	}),
	deleteSkill: authorProcedure.input(z.object({ 
		id: z.string() })).mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerDeleteSkill(input.id);
	})

});
