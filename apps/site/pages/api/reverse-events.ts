import type { NextApiRequest, NextApiResponse } from "next";
import { hub, getLast } from "@self-learning/api";

export const config = {
	// Important for streaming
	api: { bodyParser: false }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const jobId = String(req.query.jobId ?? "");
	if (!jobId) {
		res.status(400).end("Missing jobId");
		return;
	}

	console.log("SSE connection for jobId:", jobId);

	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive"
	});
	(res as any).flushHeaders?.();
	res.setHeader("X-Accel-Buffering", "no");

	const send = (evt: any) => {
		res.write(`data: ${JSON.stringify(evt)}\n\n`);
	};

	console.log("cached?", !!getLast(jobId));
	const cached = getLast(jobId);
	if (cached) send(cached);

	const listener = (evt: any) => send(evt);
	hub.on(jobId, listener);

	// optional: ping
	const ping = setInterval(() => res.write(": ping\n\n"), 15000);

	req.on("close", () => {
		clearInterval(ping);
		hub.off(jobId, listener);
		res.end();
	});
}
