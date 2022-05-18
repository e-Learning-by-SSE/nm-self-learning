import { gql } from "graphql-request";
import { cmsTypes } from "../..";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function createCompetence(data: cmsTypes.CompetenceInput) {
	try {
		const result = await cmsGraphqlClient.createCompetence({ data });
		console.log(result);
		return result;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function deleteCompetence(id: string) {
	return cmsGraphqlClient.deleteCompetence({ id });
}

gql`
	mutation createCompetence($data: CompetenceInput!) {
		createCompetence(data: $data) {
			data {
				attributes {
					title
					description
					subjects {
						data {
							attributes {
								title
							}
						}
					}
				}
			}
		}
	}
`;

gql`
	mutation deleteCompetence($id: ID!) {
		deleteCompetence(id: $id) {
			data {
				attributes {
					competenceId
					title
				}
			}
		}
	}
`;
