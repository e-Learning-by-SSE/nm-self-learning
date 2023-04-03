import { z } from "zod";

export const licenseSchema = z.object({
	licenseId: z.number(),
	name: z.string().min(3),
	licenseUrl: z.string().nullable().optional(),
	imgUrl: z.string().nullable().optional(),
	licenseText: z.string().nullable().optional(),
	oerCompatible: z.boolean().default(false),
	selectable: z.boolean().default(true)
});

export type License = z.infer<typeof licenseSchema>;
