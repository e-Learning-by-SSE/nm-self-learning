import { z } from "zod";

export const userSchema = z.object({
	name: z.string().min(3),
	email: z.string().email().nullable(),
	role: z.enum(["USER", "ADMIN"]),
	image: z.string().url().nullable(),
	displayName: z.string().min(3),
	emailVerified:  z.coerce.date().nullable(),
});
