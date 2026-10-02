import { WorkerHost } from "../lib/core/worker-host";
import { jobs } from "./index";
import type { PayloadFor, ReturnTypeOf } from "@self-learning/worker-api";

let workerHost: WorkerHost | undefined;

const runPathGeneration = async (payload: PayloadFor<"pathGeneration">) => {
	if (!workerHost) {
		throw new Error("WorkerHost not initialized");
	}
	const jobId = crypto.randomUUID();
	const { result } = await workerHost.runJob(jobId, "pathGeneration", payload, {
		requestedBy: "path-generation-job-spec"
	});
	return result as ReturnTypeOf<"pathGeneration">;
};

describe("pathGenerationJob", () => {
	beforeAll(() => {
		workerHost = new WorkerHost(jobs, { minThreads: 1, maxThreads: 1 });
	});

	afterAll(async () => {
		await workerHost?.shutdown();
		workerHost = undefined;
	});

	const baseSkills = [
		{ id: "skill-foundation", repositoryId: "repo-1", children: [] },
		{ id: "skill-target", repositoryId: "repo-1", children: [] }
	];

	const baseLessons = [
		{
			lessonId: "lesson-1",
			requires: [],
			provides: [{ id: "skill-foundation" }]
		},
		{
			lessonId: "lesson-2",
			requires: [{ id: "skill-foundation" }],
			provides: [{ id: "skill-target" }]
		}
	];

	const createPayload = (
		overrides: Partial<PayloadFor<"pathGeneration">> = {}
	): PayloadFor<"pathGeneration"> => ({
		dbSkills: baseSkills,
		goal: [{ id: "skill-target", repositoryId: "repo-1", children: [] }],
		lessons: baseLessons,
		knowledge: [],
		...overrides
	});

	it("builds an ordered learning path that satisfies prerequisites", async () => {
		// Setup
		const payload = createPayload();

		// Exercise
		const result = await runPathGeneration(payload);

		// Verify
		expect(result).not.toBeNull();
		expect(result!.lessonIds).toEqual(["lesson-1", "lesson-2"]);
		const lastSkill = baseLessons
			.find(lesson => lesson.lessonId === result!.lessonIds.at(-1))
			.provides.map(skill => skill.id);
		expect(lastSkill).toContain("skill-target");
	});

	it("skips lessons for previously acquired knowledge", async () => {
		// Setup
		const payload = createPayload({ knowledge: ["skill-foundation"] });

		// Exercise
		const result = await runPathGeneration(payload);

		// Verify
		expect(result).not.toBeNull();
		expect(result.lessonIds).toEqual(["lesson-2"]);
	});
});
