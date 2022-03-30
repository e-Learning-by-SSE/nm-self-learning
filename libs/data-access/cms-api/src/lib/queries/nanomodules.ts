import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getNanomoduleBySlug(slug: string) {
	const result = await cmsGraphqlClient.nanomoduleBySlug({ slug });
	return result.nanomodules?.data[0] ? result.nanomodules.data[0].attributes : null;
}

gql`
	query nanomoduleBySlug($slug: String) {
		nanomodules(filters: { slug: { eq: $slug } }) {
			data {
				attributes {
					slug
					title
					subtitle
					description
					meta
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
						... on ComponentNanomoduleArticle {
							__typename
							richText
						}
						... on ComponentNanomoduleVideo {
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
						... on ComponentNanomoduleYoutubeVideo {
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
											previewUrl
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
