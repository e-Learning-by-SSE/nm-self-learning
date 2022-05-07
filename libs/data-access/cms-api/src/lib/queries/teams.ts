import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getTeamBySlug(slug: string) {
	const result = await cmsGraphqlClient.teamBySlug({ slug });
	return result.teams?.data[0]?.attributes ?? null;
}

gql`
	query teamBySlug($slug: String!) {
		teams(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					description
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					authors {
						data {
							attributes {
								slug
								name
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
					institution {
						data {
							attributes {
								title
								slug
							}
						}
					}
				}
			}
		}
	}
`;
