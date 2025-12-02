import z from "zod";
import { SkillResolved } from "@self-learning/database";

//zod scheme
export const skillCreationFormSchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
	children: z.array(z.string())
});

export const skillFormSchema = skillCreationFormSchema.extend({
	id: z.string(),
	authorId: z.number(),
	parents: z.array(z.string())
});

export type SkillFormModel = z.infer<typeof skillFormSchema>;

export const skillRepositoryCreationSchema = z.object({
	ownerName: z.string(),
	name: z.string(),
	description: z.string().nullable()
});

export const skillRepositorySchema = skillRepositoryCreationSchema.extend({
	id: z.string()
});

export const createSkillFormModelFromSkillResolved = (skill: SkillResolved): SkillFormModel => {
	return {
		name: skill.name,
		description: skill.description,
		children: skill.children.map(child => child.id),
		id: skill.id,
		authorId: skill.authorId,
		parents: skill.parents.map(parent => parent.id)
	};
};
