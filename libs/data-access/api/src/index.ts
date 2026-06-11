export * from "./lib/trpc/app.router";
export * from "./lib/trpc/trpc";
export { createTrpcContext } from "./lib/trpc/context";
export * from "./lib/trpc/rest-api.handler";
export type { UserFromSession } from "./lib/trpc/context";
export * from "./lib/internationalization/withTranslation";
export * from "./lib/permissions/permission.utils";
export * from "./lib/permissions/permission.types";
export * from "./lib/permissions/permission.service";

export const API_PATH = "/api/rest";
