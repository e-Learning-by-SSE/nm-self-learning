import { JobDefinition } from "../lib/core/job-registry";
import { HelloWorldSchema } from "@self-learning/worker-api";

export const helloWorldJob: JobDefinition<"HelloWorld"> = {
	name: "HelloWorld",
	description: "A simple job that reverses a message",
	schema: HelloWorldSchema,
	run: async payload => {
		// Simple logic: reverse the input message
		const reversedMessage = payload.msg.split("").reverse().join("");
		console.log(`Worker Service: "${payload.msg}" -> "${reversedMessage}"`);
		return reversedMessage;
	}
};
