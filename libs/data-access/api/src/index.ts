export * from "./lib/trpc/app.router";
export * from "./lib/trpc/trpc";
export * from "./lib/auth";

// TODO maybe find a better place for those types
export type { SkillResolved, SkillUnresolved } from "./lib/trpc/routers/skill.router";
export type { LearningGoalType } from "./lib/trpc/routers/learning-goal.router";
