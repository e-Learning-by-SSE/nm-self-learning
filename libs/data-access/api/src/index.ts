export * from "./lib/trpc/app.router";
export * from "./lib/trpc/trpc";
export { createTrpcContext } from "./lib/trpc/context";
export * from "./lib/auth";

// TODO maybe find a better place for those types
export type { LearningGoalType } from "./lib/trpc/routers/learning-goal.router";
