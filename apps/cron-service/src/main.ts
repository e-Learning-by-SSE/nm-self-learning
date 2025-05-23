import cron from "node-cron";

const API_SECRET = process.env.SCHEDULER_SECRET;
const API_URL = process.env.SITE_BASE_URL;

function startCronSendEmail() {
	cron.schedule("0 6,12,18,0 * * *", async () => {
		console.log("Running cron job at", new Date().toISOString());
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
