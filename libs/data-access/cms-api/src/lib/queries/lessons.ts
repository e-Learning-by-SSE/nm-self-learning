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

export async function getLessonsForSync() {
	const result = await cmsGraphqlClient.lessonsForSync();
	return {
		_total: result.lessons?.meta.pagination.total,
		lessons:
			result.lessons?.data.map(({ attributes }) => {
				const attr = attributes as Exclude<typeof attributes, undefined | null>;
				const { lessonId, slug, title, subtitle } = attr;
				const imgUrl = attr.image?.data?.attributes?.url;

				return {
					lessonId,
					slug,
					title,
					subtitle,
					imgUrl
				};
			}) ?? []
	};
}

gql`
	query lessonsForSync {
		lessons {
			meta {
				pagination {
					total
				}
			}
			data {
				attributes {
					lessonId
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
