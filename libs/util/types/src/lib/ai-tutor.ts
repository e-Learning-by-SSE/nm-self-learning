import { z } from "zod";
import { UseAiTutorReturn } from "@self-learning/ai-tutor";
import { TRPCError } from "@trpc/server";

export interface AiTutorProps {
	tutorState: UseAiTutorReturn;
}

export interface AiTutorHeaderProps {
	onClose: () => void;
	onClear: () => void;
	t: (key: string) => string;
	basePath: string;
}

export interface AiTutorInputProps {
	input: string;
	isLoading: boolean;
	setInput: (value: string) => void;
	sendMessage: () => void;
	handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	t: (key: string) => string;
}

export interface AiTutorMessagesProps {
	messages: Array<{ role: string; content: string }>;
	isLoading: boolean;
	user: any;
	basePath: string;
	t: (key: string) => string;
}

export interface FloatingTutorButtonProps {
	onToggle: () => void;
	disabled?: boolean;
}

export const MessageRole = z.enum(["system", "user", "assistant"]);
export type MessageRole = z.infer<typeof MessageRole>;

export const messageSchema = z.object({
	role: MessageRole,
	content: z.string().min(1, "Message content cannot be empty")
});

export type Message = z.infer<typeof messageSchema>;

export const pageContextSchema = z.discriminatedUnion("type", [
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

export type ContextPayload =
	| {
			type: "course";
			courseTitle: string;
			courseDescription?: string;
	}
	| {
			type: "lesson";
			courseTitle: string;
			courseDescription?: string;
			lessonId: string;
			title: string;
	};

export const llmApiResponseSchema = z.object({
	message: z.object({
		content: z.string(),
		role: z.string()
	})
});

export interface LlmConfig {
	serverUrl: string;
	apiKey: string | null;
	defaultModel: string;
}

export interface FormatRagResultsInputSchema {
	results: Array<{
		text: string;
		metadata: { lessonName: string; pageNumber?: number };
	}>;
}

export const aiTutorRequestSchema = z.object({
	messages: z.array(messageSchema).min(1, "At least one message required"),
	pageContext: pageContextSchema.nullable()
});

export type AiTutorRequest = z.infer<typeof aiTutorRequestSchema>;

export const sourceReferenceSchema = z.object({
	lessonName: z.string(),
	pageNumber: z.number().optional(),
	sourceType: z.enum(["pdf", "article", "video"]).optional()
});

export type SourceReference = z.infer<typeof sourceReferenceSchema>;

export const aiTutorResponseSchema = z.object({
	content: z.string(),
	sources: z.array(sourceReferenceSchema),
	timestamp: z.date()
});

export type AiTutorResponse = z.infer<typeof aiTutorResponseSchema>;

export interface RetrievalResult {
	context: string;
	score: number;
	metadata: { lessonName: string; pageNumber?: number; sourceType?: "pdf" | "article" | "video" };
}

export const LOCAL_STORAGE_KEY = "aiTutorCurrentChat";

export const errorMap: Record<number, { code: TRPCError["code"]; message: string }> = {
	400: { code: "BAD_REQUEST", message: "Invalid request to LLM server" },
	401: { code: "UNAUTHORIZED", message: "LLM API authentication failed" },
	403: { code: "FORBIDDEN", message: "Access to LLM API forbidden" },
	404: { code: "NOT_FOUND", message: "LLM API endpoint not found" },
	429: { code: "TOO_MANY_REQUESTS", message: "LLM API rate limit exceeded" },
	500: { code: "INTERNAL_SERVER_ERROR", message: "LLM server internal error" },
	502: { code: "BAD_GATEWAY", message: "LLM server unavailable" },
	503: { code: "SERVICE_UNAVAILABLE", message: "LLM server temporarily unavailable" }
};
