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
