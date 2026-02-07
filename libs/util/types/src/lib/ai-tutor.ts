import { z } from "zod";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server";

export const tutorInputSchema = z.object({
	messages: z.array(z.object({ role: z.string().min(1), content: z.string().min(1) })),
	pageContext: z
		.object({
			type: z.enum(["course", "lesson"]),
			courseSlug: z.string().min(1),
			lessonSlug: z.string().min(1).optional()
		})
		.nullable()
});

export interface Message {
	role: string;
	content: string;
}

export interface Payload {
	type: "lesson" | "course";
	lessonId?: string;
	courseId?: string;
	title?: string;
	courseTitle?: string;
	courseDescription?: string;
}

export interface PageContext {
	type: "course" | "lesson";
	courseSlug: string;
	lessonSlug?: string;
}

export const statusToTRPCError: Record<number, { code: TRPC_ERROR_CODE_KEY; message: string }> = {
	400: { code: "BAD_REQUEST", message: "Invalid request" },
	401: { code: "UNAUTHORIZED", message: "Invalid or missing authorization token" },
	403: { code: "FORBIDDEN", message: "Forbidden" },
	404: { code: "NOT_FOUND", message: "Not found" },
	500: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" },
	502: { code: "INTERNAL_SERVER_ERROR", message: "Bad response from backend server" },
	503: { code: "TIMEOUT", message: "Backend server is unavailable" },
	504: { code: "TIMEOUT", message: "Backend server is taking too long to respond" }
};

export const LOCAL_STORAGE_KEY = "aiTutorCurrentChat";
