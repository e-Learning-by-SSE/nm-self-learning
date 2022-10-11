import { apiHandler } from "@self-learning/util/http";
import { testingActionHandler } from "@self-learning/util/testing";
import { NextApiHandler } from "next";
import { z } from "zod";

const commandSchema = z.object({
	command: z.string(),
	payload: z.any()
});

const handler: NextApiHandler = async (req, res) =>
	apiHandler(req, res, "POST", async () => {
		if (process.env.NODE_ENV === "production") {
			return res.status(418).send("Testing API is disabled in production environment.");
		}

		if (req.method === "POST") {
			const { command, payload } = commandSchema.parse(req.body);
			const fn = (testingActionHandler as Record<string, (p: unknown) => Promise<unknown>>)[
				command
			];

			if (!fn) {
				return res.status(400).send(`Unknown command: ${command}`);
			}

			await fn(payload);

			return res.status(200).send(`Command "${command}" executed.`);
		}
	});

export default handler;
