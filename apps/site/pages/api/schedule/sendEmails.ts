import { checkAndSendScheduledEmails } from "@self-learning/ui/notifications";
import { NextApiRequest, NextApiResponse } from "next";

const API_SECRET = process.env.SCHEDULER_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.headers["x-api-key"] !== API_SECRET) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	try {
		if (process.env.NODE_ENV !== "development") {
			const result = await checkAndSendScheduledEmails();
			res.status(200).json({
				status: "ok",
				result
			});
		} else {
			res.status(200).json({
				status: "E-Mail sending is disabled in development mode",
				result: {
					courseReminders: 0,
					achievementNotifications: 0,
					streakReminders: 0,
					errors: 0
				}
			});
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to send emails", details: error });
	}
}
