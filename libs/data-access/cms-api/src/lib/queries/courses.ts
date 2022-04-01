import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getCourseBySlug(slug: string) {
	const result = await cmsGraphqlClient.courseBySlug({ slug });
	return result.courses?.data[0].attributes ?? null;
}

gql`
	query courseBySlug($slug: String!) {
		courses(filters: { slug: { eq: $slug } }) {
			data {
				id
				attributes {
					title
					slug
					subtitle
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
					content {
						__typename
						... on ComponentNanomoduleChapter {
							__typename
							title
							lessons {
								data {
									attributes {
										slug
										title
									}
								}
							}
							courses {
								data {
									attributes {
										title
										slug
									}
								}
							}
						}
						... on ComponentNanomoduleNanomoduleRelation {
							nanomodule {
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
		}
	}
`;
