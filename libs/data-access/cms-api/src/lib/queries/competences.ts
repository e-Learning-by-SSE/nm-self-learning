import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getCompetences() {
	const result = await cmsGraphqlClient.competences();
	return (
		result.competences?.data.map(({ attributes, id }) => ({
			_id: id,
			...(attributes as Exclude<typeof attributes, null | undefined>)
		})) ?? []
	);
}

gql`
	query competences {
		competences {
			data {
				id
				attributes {
					competenceId
					title
					description
					subjects {
						data {
							attributes {
								slug
								title
							}
						}
					}
					specialities {
						data {
							attributes {
								slug
								title
							}
						}
					}
				}
			}
		}
	}
`;
