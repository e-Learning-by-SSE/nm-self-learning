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