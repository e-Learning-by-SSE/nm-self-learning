import { z } from "zod";

export const aiTutorProfileSchema = z.object({
	id: z.string().cuid("Invalid ID").optional(),
	name: z.string().min(1, "Name is required"),
	author: z.string().min(1, "Author is required"),
	model: z.string().min(1, "Model is optional").optional(),
	avatarUrl: z.string().url("Must be a valid URL").optional(),
	systemPrompt: z.string().min(1, "System context is required"),
	description: z.string().optional(),
	updatedAt: z.date().optional()
});
