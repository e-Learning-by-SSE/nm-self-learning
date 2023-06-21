import { z } from "zod";

export const licenseSchema = z.object({
	licenseId: z.number(),
	name: z.string().min(3),
	url: z.string().nullable().optional(),
	logoUrl: z.string().nullable().optional(),
	licenseText: z.string().nullable().optional(),
	oerCompatible: z.boolean().default(false),
	selectable: z.boolean().default(true),
	defaultSuggestion: z.boolean().default(false)
});

export type License = z.infer<typeof licenseSchema>;
