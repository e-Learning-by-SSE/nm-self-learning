import { z } from "zod";
import { GoalType } from "@prisma/client";

export const goalFormSchema = z.object({
	id: z.string().nullable(),
	type: z.nativeEnum(GoalType),
	description: z.string(),
	targetValue: z.number(),
	actualValue: z.number(),
	priority: z.number(),
	achieved: z.boolean()
});

export type GoalFormModel = z.infer<typeof goalFormSchema>;
