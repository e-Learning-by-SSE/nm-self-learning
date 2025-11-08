import { z } from "zod";

const permissionSchema = z.object({
	subjectId: z.string().nullable(),
	courseId: z.string().nullable(),
	lessonId: z.string().nullable()
});

export const authorSchema = z.object({
	displayName: z.string().min(3),
	slug: z.string().min(3),
	imgUrl: z.string().url().nullable(),
	permissions: z.array(permissionSchema)
});

/**
 * This schema can be used to validate the author relations in another schema
 *
 * @example
 * export const courseFormSchema = z.object({
 *		slug: z.string().min(3),
 *		title: z.string().min(3),
 *		description: z.string().nullable(),
 *		authors: authorsRelationSchema,
 * });
 */
export const authorsRelationSchema = z.array(
	z.object({
		username: z.string()
	})
);

export type Author = z.infer<typeof authorSchema>;
