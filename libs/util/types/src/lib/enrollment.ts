import { ResolvedValue } from "@self-learning/types";
import { getEnrollmentDetails } from "@self-learning/api";

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type EnrollmentDetails = ArrayElement<Awaited<ResolvedValue<typeof getEnrollmentDetails>>>;
