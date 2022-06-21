import "dotenv/config";
import algoliasearch from "algoliasearch";
import { database } from "@self-learning/database";

async function main() {
	const appId = process.env.ALGOLIA_APPLICATION_ID;
	const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;

	if (!appId || !apiKey) {
		throw new Error(
			"ALGOLIA_APPLICATION_ID and ALGOLIA_ADMIN_API_KEY environment variables must be defined."
		);
	}

	console.log("🟦 Algolia Sync\n");
	console.log(`ALGOLIA_APPLICATION_ID = ${appId.substring(0, 4).padEnd(appId.length, "*")}`);
	console.log(`ALGOLIA_ADMIN_API_KEY = ${apiKey.substring(0, 4).padEnd(apiKey.length, "*")}\n`);

	const client = algoliasearch(appId, apiKey);

	const lessonsIndex = client.initIndex("lessons");

	lessonsIndex.setSettings({
		searchableAttributes: ["title", "subtitle", "description"]
	});

	const lessons = (
		await database.lesson.findMany({
			select: {
				lessonId: true,
				imgUrl: true,
				title: true,
				slug: true,
				subtitle: true,
				description: true
			}
		})
	).map(lesson => {
		return {
			...lesson,
			objectID: lesson.lessonId
		};
	});

	await lessonsIndex.replaceAllObjects(lessons);

	console.log(`Synchronized ${lessons.length !== 1 ? "lessons" : "lesson"}.`);
	console.log("🟩 Algolia Sync completed\n");
}

main().catch(error => console.error(error));
