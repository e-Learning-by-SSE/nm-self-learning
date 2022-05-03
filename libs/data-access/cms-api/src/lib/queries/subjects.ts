import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getSubjects() {
	const result = await cmsGraphqlClient.subjects();
	return result.subjects?.data ?? [];
}

gql`
	query subjects {
		subjects {
			data {
				attributes {
					title
					slug
					subtitle
					imageCard {
						data {
							attributes {
								url
							}
						}
					}
				}
			}
		}
	}
`;
