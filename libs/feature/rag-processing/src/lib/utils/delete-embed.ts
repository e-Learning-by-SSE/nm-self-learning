import { vectorStore } from "../services/vector-store";

export async function deleteEmbedding(lessonId: string): Promise<void> {
	console.log("[LessonRouter] Deleting lesson from vector store", { lessonId });

	try {
		const exists = await vectorStore.lessonExists(lessonId);

		if (exists) {
			await vectorStore.deleteLesson(lessonId);
			console.log("[LessonRouter] Lesson deleted from vector store", { lessonId });
		} else {
			console.log("[LessonRouter] Lesson not found in vector store", { lessonId });
		}
	} catch (error) {
		console.error("[LessonRouter] Failed to delete lesson", error, { lessonId });
		throw error;
	}
}
