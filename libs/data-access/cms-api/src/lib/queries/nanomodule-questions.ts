import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getNanomoduleQuestionsBySlug(slug: string) {
	const result = await cmsGraphqlClient.getNanomoduleQuestionsBySlug({ slug });
	return result.nanomodules?.data[0].attributes ? result.nanomodules?.data[0].attributes : null;
}

gql`
	query getNanomoduleQuestionsBySlug($slug: String!) {
		nanomodules(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					questions
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
				}
			}
		}
	}
`;
