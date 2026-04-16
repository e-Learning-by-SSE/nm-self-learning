import { vectorStore } from "../services/vector-store";

export async function deleteEmbedding(lessonId: string): Promise<void> {
	try {
		const exists = await vectorStore.lessonExists(lessonId);

		if (exists) {
			await vectorStore.deleteLesson(lessonId);
		} else {
			console.error("[LessonRouter] Lesson not found in vector store", { lessonId });
		}
	} catch (error) {
		console.error("[LessonRouter] Failed to delete lesson", error, { lessonId });
		throw error;
	}
}
