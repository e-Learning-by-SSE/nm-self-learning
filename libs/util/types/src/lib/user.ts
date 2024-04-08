import { z } from "zod";

export const userSchema = z.object({
	name: z.string().min(3),
	email: z.string().email().nullable(),
	role: z.enum(["USER", "ADMIN"]),
	image: z.string().url().nullable(),
	displayName: z.string().min(3),
	emailVerified:  z.preprocess((arg) => {
		// Using z.preprocess, we ensure the server accurately processes incoming date strings
		if (typeof arg === 'string') {
		  const date = new Date(arg);
		  if (!isNaN(date.getTime())) {
			return date; 
		  }
		}
		return arg; 
	  }, z.date().nullable()),
});
