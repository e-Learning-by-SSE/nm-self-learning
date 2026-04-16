import { z } from "zod";

export type Message = {
	role: "user" | "assistant" | "system";
	content: string;
};

const pageContextSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("course"),
		courseSlug: z.string()
	}),
	z.object({
		type: z.literal("lesson"),
		courseSlug: z.string(),
		lessonSlug: z.string()
	})
]);

export type PageContext = z.infer<typeof pageContextSchema>;

interface BaseContextPayload {
	courseTitle: string;
	courseDescription?: string;
}

interface CourseContextPayload extends BaseContextPayload {
	type: "course";
}

interface LessonContextPayload extends BaseContextPayload {
	type: "lesson";
	lessonId: string;
	title: string;
}

export type LessonwithoutCourseContextPayload = {
	type: "lesson";
	lessonId: string;
	title: string;
};

export type ContextPayload = CourseContextPayload | LessonContextPayload;

export const aiTutorRequestSchema = z.object({
	messages: z.array(
		z.object({
			role: z.enum(["user", "assistant", "system"]),
			content: z.string().min(1, "Message content cannot be empty")
		})
	),
	pageContext: pageContextSchema.nullable()
});
