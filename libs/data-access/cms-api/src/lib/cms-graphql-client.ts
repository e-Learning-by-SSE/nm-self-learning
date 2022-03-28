import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated-graphql";

export const cmsGraphqlClient = getSdk(new GraphQLClient("http://localhost:1337/graphql"));
