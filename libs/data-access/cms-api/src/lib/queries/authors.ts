import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export function getAuthors() {
	return cmsGraphqlClient.authors();
}

gql`
	query authors {
		authors {
			data {
				attributes {
					slug
					name
					image {
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

export async function getAuthorBySlug(slug: string) {
	const result = await cmsGraphqlClient.authorBySlug({ slug });
	return result.authors?.data[0]?.attributes ?? null;
}

gql`
	query authorBySlug($slug: String) {
		authors(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					name
					aboutMe
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					teams {
						data {
							attributes {
								slug
								title
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
					courses {
						data {
							attributes {
								slug
								title
								subtitle
								createdAt
								updatedAt
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
					lessons {
						data {
							attributes {
								slug
								title
								subtitle
								createdAt
								updatedAt
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
