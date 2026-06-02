import { z } from "zod";
import { ResourcePermissionsFormSchema } from "./resource";

export const specializationSchema = z.object({
	specializationId: z.string(),
	subjectId: z.string(),
	title: z.string().min(3),
	slug: z.string().min(3),
	subtitle: z.string(),
	cardImgUrl: z.url().nullable(),
	imgUrlBanner: z.url().nullable(),
	permissions: ResourcePermissionsFormSchema
});

export type Specialization = z.infer<typeof specializationSchema>;

export const specializationRelationSchema = z.array(
	z.object({
		specializationId: z.string()
	})
);

export type SpecializationRelation = z.infer<typeof specializationRelationSchema>;
