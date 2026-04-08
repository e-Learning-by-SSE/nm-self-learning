import { Author } from "@self-learning/types";
import { database } from "@self-learning/database";

export async function updateAuthorAsAdmin({
	author,
	username
}: {
	author: Author;
	username: string;
}) {
	return await database.$transaction(async tx => {
		const updatedAuthor = await tx.author.update({
			where: { username },
			data: { displayName: author.displayName, imgUrl: author.imgUrl, slug: author.slug }
		});
		await tx.user.update({
			where: { name: username },
			data: { defaultGroupId: author.defaultGroupId }
		});
		return updatedAuthor;
	});
}
