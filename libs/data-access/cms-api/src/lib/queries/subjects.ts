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

export async function getSubjectBySlug(slug: string) {
	const result = await cmsGraphqlClient.subjectBySlug({ slug });
	return result.subjects?.data[0].attributes ?? null;
}

gql`
	query subjectBySlug($slug: String!) {
		subjects(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					title
					slug
					subtitle
					description
					specialities {
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
					imageBanner {
						data {
							attributes {
								url
							}
						}
					}
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
