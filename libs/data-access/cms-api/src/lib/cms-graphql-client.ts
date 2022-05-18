import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated-graphql";

const url = process.env.CMS_GRAPHQL_URL || "http://localhost:1337/graphql";

export const cmsGraphqlClient = getSdk(new GraphQLClient(url));
