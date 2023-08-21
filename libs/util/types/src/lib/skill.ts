import z from "zod";

//zod scheme
export const skillCreationFormSchema = z.object({
	owner: z.string(),
	name: z.string(),
	level: z.number(),
	description: z.string().optional(),
	nestedSkills: z.array(z.string())
});
export type SkillCreationFormModel = z.infer<typeof skillCreationFormSchema>;

export const skillRepositoryCreationSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	description: z.string().optional(),
	ownerId: z.string()
});

export type SkillRepositoryCreation = z.infer<typeof skillRepositoryCreationSchema>;
