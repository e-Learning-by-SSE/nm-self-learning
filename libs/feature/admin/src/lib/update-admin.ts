import { Author } from "@self-learning/types";
import { database } from "@self-learning/database";

export function updateAuthorAsAdmin({ author, username }: { author: Author; username: string }) {
	return database.author.update({
		where: { username },
		data: {
			displayName: author.displayName,
			imgUrl: author.imgUrl,
			slug: author.slug,
			subjectAdmin: {
				deleteMany: { username },
				createMany: {
					data: author.subjectAdmin.map(({ subjectId }) => ({
						subjectId
					}))
				}
			},
			specializationAdmin: {
				deleteMany: { username },
				createMany: {
					data: author.specializationAdmin.map(({ specializationId }) => ({
						specializationId
					}))
				}
			}
		}
	});
}
