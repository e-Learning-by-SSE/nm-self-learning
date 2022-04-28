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
							description
							lessons {
								data {
									attributes {
										slug
										title
									}
								}
							}
						}
						... on ComponentNanomoduleCourseRelation {
							title
							description
							course {
								data {
									attributes {
										title
										subtitle
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
						... on ComponentNanomoduleNanomoduleRelation {
							__typename
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

export async function getCoursesWithSlugs(slugs: string[]) {
	const result = await cmsGraphqlClient.coursesWithSlugs({ slugs });
	return (
		result.courses?.data.map(
			data => data.attributes as Exclude<typeof data["attributes"], null | undefined>
		) ?? []
	);
}

gql`
	query coursesWithSlugs($slugs: [String]!) {
		courses(filters: { slug: { in: $slugs } }) {
			data {
				attributes {
					slug
					title
					subtitle
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
