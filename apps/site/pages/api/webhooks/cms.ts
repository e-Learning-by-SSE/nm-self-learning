import { processWebhookNotification } from "@self-learning/webhooks";
import { NextApiHandler } from "next";

const webhookApiHandler: NextApiHandler = async (req, res) => {
	if (req.headers.authorization !== process.env.STRAPI_WEBHOOK_TOKEN) {
		console.error(
			"[api/webhooks/cms]: Refusing to process webhook notification. Value of 'STRAPI_WEBHOOK_TOKEN' from 'authorization' header does not match."
		);
		return res
			.status(403)
			.end("Value of 'STRAPI_WEBHOOK_TOKEN' from 'authorization' header does not match.");
	}

	switch (req.method) {
		case "POST": {
			try {
				await processWebhookNotification(req.body);
				return res.status(204).end();
			} catch (error) {
				console.error("[api/webhooks/cms]: Failed to process a webhook", error);
				return res.status(500).end("Failed to process the notification.");
			}
		}
		default: {
			res.status(405).end(`Method ${req.method} Not Allowed`);
		}
	}
};

export default webhookApiHandler;
