import { z } from "zod";
import { JobDefinition } from "../lib/core/job-registry";

export const helloWorldSchema = z.object({
	message: z.string().min(1)
});

export const helloWorldJob: JobDefinition<z.infer<typeof helloWorldSchema>, string> = {
	name: "hello-world",
	description: "A simple job that reverses a message",
	schema: helloWorldSchema,
	run: async payload => {
		// Simple logic: reverse the input message
		const reversedMessage = payload.message.split("").reverse().join("");
		console.log(`Worker Service: "${payload.message}" -> "${reversedMessage}"`);
		return reversedMessage;
	}
};
