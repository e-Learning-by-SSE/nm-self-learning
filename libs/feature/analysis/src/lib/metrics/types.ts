import { ResolvedValue } from "@self-learning/types";
import { loadUserEventLogs } from "@self-learning/util/eventlog/server";

export type MetricResult = { createdAt: Date; values: Record<string, number> };

export type UserEvent = ResolvedValue<typeof loadUserEventLogs>[number];
