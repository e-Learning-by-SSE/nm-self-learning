import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getSpecializationBySlug(slug: string) {
	const result = await cmsGraphqlClient.specializationBySlug({ slug });
	return result.specialities?.data[0].attributes ?? null;
}

gql`
	query specializationBySlug($slug: String!) {
		specialities(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					subtitle
					description
					subject {
						data {
							attributes {
								title
								slug
							}
						}
					}
					imageBanner {
						data {
							attributes {
								url
							}
						}
					}
					courses {
						data {
							attributes {
								courseId
								slug
								title
								subtitle
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
			}
		}
	}
`;
