import "dotenv/config";
import cron from "node-cron";
import { database, generateTokenForUser, save_subtitle_for_lesson } from "@self-learning/database";
import { LessonContent, LessonContentType, subtitleSrcSchema, Video } from "@self-learning/types";
import io from "socket.io-client";
import { embedLesson } from "./rag";

const API_SECRET = process.env.SCHEDULER_SECRET;
const API_URL = process.env.NEXT_PUBLIC_SITE_BASE_URL;

async function generateSubtitlesForExistingVideos() {
	if (
		process.env.NEXT_PUBLIC_TRANSCRIPTION_MIGRATE_EXISTING_VIDEO_CONTENT === "true" &&
		process.env.NEXT_PUBLIC_TRANSCRIPTION_SERVICE_URL
	) {
		console.log("Starting migration of existing video content to add subtitles...");
		function isVideoContent(content: LessonContentType): content is Video {
			return content.type === "video";
		}
		const localStorages = ["https://staging.sse.uni-hildesheim.de:9006/upload/"];
		localStorages.push(process.env.MINIO_ENDPOINT);
		console.log(
			"Using the following local storages to identify video content for migration:",
			localStorages
		);

		// Generate valid JWT with admin privileges to call the transcription API
		const admin = await database.user.findFirst({
			where: { role: "ADMIN" },
			select: {
				id: true
			}
		});

		if (!admin) {
			console.error("No admin user found. Cannot generate token for transcription API.");
			return;
		}

		const token = await generateTokenForUser({ id: admin.id });

		// Locate all existing video content, stored locally on our MinIO instance, which do not have any subtitles yet
		const allLessons = await database.lesson.findMany({});
		const jobs = allLessons
			.map(lesson => ({
				...lesson,
				content: lesson.content as LessonContent
			}))
			.flatMap(lesson =>
				lesson.content
					.filter(isVideoContent)
					.filter(videoContent => !videoContent.value.subtitle)
					.filter(videoContent =>
						localStorages.some(storage => videoContent.value.url.includes(storage))
					)
					.map(videoContent => ({
						lessonId: lesson.lessonId,
						lessonTitle: lesson.title,
						videoUrl: videoContent.value.url
					}))
			);

		console.log(`Found ${jobs.length} videos with missing subtitles. Starting migration...`);
		if (jobs.length === 0) {
			console.log("No jobs to process.");
			return;
		}

		// Trigger migration
		const socket = io(process.env.NEXT_PUBLIC_TRANSCRIPTION_SERVICE_URL);
		let currentIndex = 0;
		let isProcessing = false;

		function sendNextJob() {
			if (isProcessing) {
				return;
			}

			if (currentIndex >= jobs.length) {
				console.log("All jobs finished.");
				socket.disconnect();
				return;
			}

			const job = jobs[currentIndex];
			isProcessing = true;

			console.log(
				`[${currentIndex + 1}/${jobs.length}] Migrating video content with URL ${job.videoUrl} for lesson ${job.lessonTitle} (${job.lessonId})`
			);

			socket.emit("transcribe", {
				video_url: job.videoUrl,
				realtime: true,
				lessonId: job.lessonId,
				bearer_token: token
			});
		}

		socket.on("connect", () => {
			console.log("Connected to transcription service. Starting migration...");
			sendNextJob();
		});

		socket.on("complete", async data => {
			const finishedJob = jobs[currentIndex];
			const transcription = data.transcription;
			const subtitleSrc = subtitleSrcSchema.parse(transcription);
			let embeddedSuccessfully = false;
			try {
				save_subtitle_for_lesson(finishedJob.lessonId, finishedJob.videoUrl, subtitleSrc);
				console.log(
					`Saved subtitle for lesson ${finishedJob.lessonId} after transcription.`
				);
				embeddedSuccessfully = true;
			} catch (err) {
				console.error("Failed saving subtitle", err);
			}

			if (embeddedSuccessfully) {
				try {
					await embedLesson(finishedJob.lessonId);
					console.log(`Embedded lesson ${finishedJob.lessonId} after transcription.`);
				} catch (err) {
					console.error("Failed embedding lesson after transcription", err);
				}
			}
			isProcessing = false;
			currentIndex += 1;
			sendNextJob();
		});

		socket.on("error", err => {
			const failedJob = jobs[currentIndex];

			console.error(
				`[${currentIndex + 1}/${jobs.length}] Failed ${failedJob?.videoUrl}:`,
				err
			);

			isProcessing = false;
			currentIndex += 1;
			sendNextJob();
		});

		socket.on("connect_error", err => {
			console.error("Socket connect error:", err.message, err);
		});

		socket.on("disconnect", reason => {
			console.log("Socket disconnected:", reason);
		});

		socket.connect();
	}
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
generateSubtitlesForExistingVideos();
