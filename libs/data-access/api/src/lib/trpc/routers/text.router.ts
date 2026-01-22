import { t } from "../trpc";
import { z } from "zod";
import { workerServiceClient } from "../../worker/worker-client";
import { publish } from "../../worker/job-hub";
import { TRPCError } from "@trpc/server";

type WorkerFacade = {
	reverse: { mutate: (input: any) => Promise<{ jobId: string }> };
	onReversed: {
		subscribe: (
			input: any,
			opts: { onData: (data: any) => void; onError?: (err: any) => void }
		) => { unsubscribe: () => void };
	};
};

const worker = workerServiceClient as unknown as WorkerFacade;

export const textRouter = t.router({
	startReverse: t.procedure.input(z.object({ text: z.string() })).mutation(async ({ input }) => {
		try {
			console.log(`Submitte Job to reverse text: ${input.text}`);
			const { jobId } = await worker.reverse.mutate({ message: input.text });
			console.log(`${input.text} -> assigned Job ID: ${jobId}`);

			const sub = worker.onReversed.subscribe(
				{ jobId },
				{
					onData: data => {
						console.log("worker subscription got data", jobId, data);
						publish(jobId, {
							type: "done",
							value: typeof data === "string" ? data : JSON.stringify(data)
						});
						sub.unsubscribe();
					},
					onError: err => {
						console.log("worker subscription error", jobId, err);
						publish(jobId, { type: "error", message: String(err) });
						sub.unsubscribe();
					}
				}
			);
			return { jobId };
		} catch (err) {
			console.error("startReverse failed:", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "startReverse failed",
				cause: err as any
			});
		}
	})

	// onReverse: t.procedure.input(z.object({ jobId: z.string() })).subscription(({ input }) => {
	// 	return observable<ReverseEvent>(emit => {
	// 		const listener = (evt: ReverseEvent) => emit.next(evt);
	// 		hub.on(input.jobId, listener);
	// 		return () => hub.off(input.jobId, listener);
	// 	});
	// })
});
