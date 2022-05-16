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
		await processWebhookNotification(req.body);
		console.log("[api/webhooks/cms]: Notification was processed successfully.");
		return res.status(204).end();
	} catch (error) {
		console.error("[api/webhooks/cms]: Failed to process a webhook\n", error);
		return res.status(500).end("Failed to process the notification.");
	}
};

export default webhookApiHandler;
