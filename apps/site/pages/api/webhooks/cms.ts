import {
	ApiError,
	Forbidden,
	InternalServerError,
	MethodNotAllowed,
	withApiError
} from "@self-learning/util/http";
import { processWebhookNotification } from "@self-learning/webhooks";
import { StatusCodes } from "http-status-codes";
import { NextApiHandler } from "next";

const webhookApiHandler: NextApiHandler = async (req, res) => {
	if (req.method !== "POST") {
		return withApiError(res, MethodNotAllowed(req.method));
	}

	if (req.headers.authorization !== process.env.STRAPI_WEBHOOK_TOKEN) {
		console.error(
			"[api/webhooks/cms]: Refusing to process webhook notification. Value of 'STRAPI_WEBHOOK_TOKEN' from 'authorization' header does not match."
		);
		return withApiError(
			res,
			Forbidden("Value of 'STRAPI_WEBHOOK_TOKEN' from 'authorization' header does not match.")
		);
	}

	try {
		const result = await processWebhookNotification(req.body);
		console.log("[api/webhooks/cms]: Notification was processed successfully\n", result);
		return res
			.status(result.operation === "CREATED" ? StatusCodes.CREATED : StatusCodes.OK)
			.json(result);
	} catch (error) {
		if (error instanceof ApiError) {
			return withApiError(res, error);
		}

		console.error("[api/webhooks/cms]: Failed to process a webhook\n", {
			event: req.body.event,
			model: req.body.model
		});
		console.error(error);

		return withApiError(res, InternalServerError("Failed to process a webhook"));
	}
};

export default webhookApiHandler;
