import { authProcedure, t } from "../trpc";

export const servicesRouter = t.router({
	getTranscriptionServiceUrl: authProcedure.query(() => {
		return process.env.TRANSCRIPTION_SERVICE_URL || null;
	})
});
