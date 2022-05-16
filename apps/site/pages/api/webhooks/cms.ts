import { ApiError, withApiError } from "@self-learning/util/validation";
import { processWebhookNotification } from "@self-learning/webhooks";
import { NextApiHandler } from "next";

const webhookApiHandler: NextApiHandler = async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	if (req.headers.authorization !== process.env.STRAPI_WEBHOOK_TOKEN) {
		console.error(
			"[api/webhooks/cms]: Refusing to process webhook notification. Value of 'STRAPI_WEBHOOK_TOKEN' from 'authorization' header does not match."
		);
		return res
			.status(403)
			.end("Value of 'STRAPI_WEBHOOK_TOKEN' from 'authorization' header does not match.");
	}

	try {
		const result = await processWebhookNotification(req.body);
		console.log("[api/webhooks/cms]: Notification was processed successfully\n", result);
		return res.status(result.operation === "CREATED" ? 201 : 200).json(result);
	} catch (error) {
		if (error instanceof ApiError) {
			return withApiError(res, error);
		}

		console.error("[api/webhooks/cms]: Failed to process a webhook\n", {
			event: req.body.event,
			model: req.body.model
		});
		console.error(error);
		return res.status(500).end("Failed to process the notification.");
	}
};

export default webhookApiHandler;
