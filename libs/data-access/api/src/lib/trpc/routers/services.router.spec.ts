import type { Context } from "../context";
import { servicesRouter } from "./services.router";

describe("services.getTranscriptionServiceUrl", () => {
	const originalUrl = process.env.TRANSCRIPTION_SERVICE_URL;
	const context: Context = {
		user: {
			id: "user-id",
			name: "user",
			role: "USER",
			isAuthor: false,
			memberships: [],
			featureFlags: {
				learningDiary: false,
				learningStatistics: false,
				experimental: false
			}
		}
	};

	afterEach(() => {
		if (originalUrl === undefined) delete process.env.TRANSCRIPTION_SERVICE_URL;
		else process.env.TRANSCRIPTION_SERVICE_URL = originalUrl;
	});

	it("reads the environment for each request", async () => {
		const caller = servicesRouter.createCaller(context);
		process.env.TRANSCRIPTION_SERVICE_URL = "https://transcription-a.example";
		expect(await caller.getTranscriptionServiceUrl()).toBe("https://transcription-a.example");
		process.env.TRANSCRIPTION_SERVICE_URL = "https://transcription-b.example";
		expect(await caller.getTranscriptionServiceUrl()).toBe("https://transcription-b.example");
	});

	it.each([undefined, ""])("disables transcription when the URL is %s", async value => {
		if (value === undefined) delete process.env.TRANSCRIPTION_SERVICE_URL;
		else process.env.TRANSCRIPTION_SERVICE_URL = value;
		expect(await servicesRouter.createCaller(context).getTranscriptionServiceUrl()).toBeNull();
	});

	it("requires authentication", async () => {
		await expect(
			servicesRouter.createCaller({}).getTranscriptionServiceUrl()
		).rejects.toMatchObject({
			code: "UNAUTHORIZED"
		});
	});
});
