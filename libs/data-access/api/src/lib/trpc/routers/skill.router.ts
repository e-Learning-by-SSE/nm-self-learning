import { database } from "@self-learning/database";
import { t, adminProcedure} from "../trpc";
import * as z from "zod";
import { licenseSchema } from "@self-learning/types";
import { OpenAPI, SkillService, SkillCreationDto } from "@self-learning/competence-rep";
import { skillCreationDtoSchema } from "libs/data-access/openapi-client/src/models/SkillCreationDto";
import { skillRepositoryCreationDtoSchema } from "libs/data-access/openapi-client/src/models/SkillRepositoryCreationDto";

//TODO: SECURITY: Check if user is allowed to do this

export const skillRouter = t.router({
	getRepsFromUser: t.procedure.query(async () => {
		//make owner dynamic
		return (await SkillService.skillMgmtControllerListRepositories("5")).repositories;
	}),
	getUnresolvedSkillsFromRepo: t.procedure.input(
		z.object({ id: z.string() }))
		.query( async({ input }) => {
		return await SkillService.skillMgmtControllerLoadRepository(input.id);
	}),
	addRepo: t.procedure.input(
		z.object({ rep: skillRepositoryCreationDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerCreateRepository(input.rep);
	}),
	getSkillFromId: t.procedure.input(
		z.object({ id: z.string() }))
		.query( async({ input }) => {
		return await SkillService.skillMgmtControllerGetSkill(input.id);
	}),
	getSkillsFromIdArray: t.procedure.input(
		z.object({ ids: z.array(z.string()) }))
		.query( async({ input }) => {
		const skills = [];
		for (const id of input.ids) {
			skills.push(await SkillService.skillMgmtControllerGetSkill(id));
		}
		return skills;
	}),
	changeSkillById: t.procedure.input(z.object({ 
		id: z.string(), 
		skill: skillCreationDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerAdaptSkill(input.id, input.skill);
	}),
	createSkill: t.procedure.input(z.object({ 
		id: z.string(), 
		skill: skillCreationDtoSchema }))
		.mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerAddSkill(input.id, input.skill);
	}),
	deleteSkill: t.procedure.input(z.object({ 
		id: z.string() })).mutation( async({ input }) => {
		return await SkillService.skillMgmtControllerDeleteSkill(input.id);
	})

});
