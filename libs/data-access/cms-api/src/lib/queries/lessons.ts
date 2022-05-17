import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getLessonBySlug(slug: string) {
	const result = await cmsGraphqlClient.lessonBySlug({ slug });
	return result.lessons?.data[0] ? result.lessons.data[0].attributes : null;
}

gql`
	query lessonBySlug($slug: String) {
		lessons(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					lessonId
					slug
					title
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
					content {
						... on ComponentContentArticle {
							__typename
							richText
						}
						... on ComponentContentVideo {
							__typename
							video {
								data {
									attributes {
										url
										mime
									}
								}
							}
						}
						... on ComponentContentYoutubeVideo {
							__typename
							url
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
				}
			}
		}
	}
`;
