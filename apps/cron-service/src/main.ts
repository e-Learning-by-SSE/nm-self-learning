import "dotenv/config";
import cron from "node-cron";
import "@self-learning/database";
import { database } from "@self-learning/database";
import { subDays } from "date-fns";

const API_SECRET = process.env.SCHEDULER_SECRET;
const API_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;

function startCronSendEmail() {
	const cronConfig = "*/10 * * * *"; // Every 10 minutes
	console.log("Schedule sendEmails cron job at:", new Date(), "with config", cronConfig);
	cron.schedule(cronConfig, async () => {
		console.log("Running sendEmail cron job at", new Date().toISOString());
		try {
			const res = await fetch(API_URL + "/api/schedule/sendEmails", {
				method: "GET",
				headers: {
					"x-api-key": "" + API_SECRET
				}
			});
			const data = await res.json();
			console.log("Result:", data);
		} catch (error) {
			console.error("Error calling API:", error);
		}
	});
}

/**
 * Cleanup old worker job results, which may contain large payloads.
 */
function cleanupWorkerJobRecords() {
	const cronConfig = "0 0 * * *"; // Once a day
	console.log(
		"Schedule cleanupWorkerJobRecords cron job at:",
		new Date(),
		"with config",
		cronConfig
	);
	cron.schedule(cronConfig, async () => {
		console.log("Running cleanupWorkerJobRecords cron job at", new Date().toISOString());
		database.jobQueue
			.deleteMany({
				where: {
					AND: {
						updatedAt: {
							lt: subDays(new Date(), 1)
						},
						status: "FINISHED"
					}
				}
			})
			.then(result => {
				console.log(`Deleted ${result.count} old job records.`);
			})
			.catch(error => {
				console.error("Error deleting old job records:", error);
			});
	});
}

startCronSendEmail();
cleanupWorkerJobRecords();
