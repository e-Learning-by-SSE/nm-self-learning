import { database } from "@self-learning/database";

export async function isAuthor(username: string, slug: string) {
	try {
		const course = await database.course.findUniqueOrThrow({
			where: { slug },
			include: { authors: true }
		});
		return course.authors.some(author => author.username === username);
	} catch (err) {
		console.error("Error checking author:", err);
		return false;
	}
}
