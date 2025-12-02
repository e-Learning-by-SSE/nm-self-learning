import "dotenv/config";
import cron from "node-cron";

const API_SECRET = process.env.SCHEDULER_SECRET;
const API_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;

if (!API_URL) {
	console.error("❌ SITE_BASE_URL is missing in cron-service environment");
	process.exit(1);
}

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

startCronSendEmail();
