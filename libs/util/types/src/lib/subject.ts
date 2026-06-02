import { z } from "zod";
import { ResourcePermissionsFormSchema } from "./group";

export const subjectSchema = z.object({
	subjectId: z.string(),
	title: z.string().min(3),
	slug: z.string().min(3),
	subtitle: z.string(),
	cardImgUrl: z.url().nullable(),
	imgUrlBanner: z.url().nullable(),
	permissions: ResourcePermissionsFormSchema
});

export type Subject = z.infer<typeof subjectSchema>;
