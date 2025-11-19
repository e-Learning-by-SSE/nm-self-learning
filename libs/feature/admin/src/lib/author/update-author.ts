import { Author } from "@self-learning/types";
import { database } from "@self-learning/database";

export function updateAuthorAsAdmin({ author, username }: { author: Author; username: string }) {
	return database.author.update({
		where: { username },
		data: { displayName: author.displayName, imgUrl: author.imgUrl, slug: author.slug }
	});
}
