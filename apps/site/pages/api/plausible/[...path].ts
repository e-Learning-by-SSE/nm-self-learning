import { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const path = Array.isArray(req.query.path) ? req.query.path.join("/") : "";
	const isScript = path === "js/script.js" || path === "js/script.local.js";
	const isEvent = path === "api/event";
	if (!isScript && !isEvent) return res.status(404).end();
	if ((isScript && req.method !== "GET") || (isEvent && req.method !== "POST")) {
		res.setHeader("Allow", isScript ? "GET" : "POST");
		return res.status(405).end();
	}

	try {
		const customInstance = process.env.PLAUSIBLE_CUSTOM_INSTANCE;
		const baseUrl = (customInstance || "https://plausible.io").replace(/\/+$/, "");
		const upstreamPath =
			isScript && customInstance ? path.replace("script", "plausible") : path;
		const headers = new Headers();
		for (const name of [
			"accept",
			"content-type",
			"user-agent",
			"referer",
			"origin",
			"x-forwarded-for"
		]) {
			const value = req.headers[name];
			if (typeof value === "string") headers.set(name, value);
		}
		if (!headers.has("x-forwarded-for") && req.socket?.remoteAddress) {
			headers.set("x-forwarded-for", req.socket.remoteAddress);
		}
		let body: Buffer | undefined;
		if (isEvent) {
			const chunks: Buffer[] = [];
			let size = 0;
			for await (const chunk of req) {
				const buffer = Buffer.from(chunk);
				size += buffer.length;
				if (size > 1024 * 1024) return res.status(413).end();
				chunks.push(buffer);
			}
			body = Buffer.concat(chunks);
		}
		const upstream = await fetch(`${baseUrl}/${upstreamPath}`, {
			method: req.method,
			headers,
			body: body ? Uint8Array.from(body) : undefined,
			redirect: "manual"
		});
		for (const name of ["content-type", "cache-control"]) {
			const value = upstream.headers.get(name);
			if (value) res.setHeader(name, value);
		}
		return res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
	} catch {
		return res.status(502).json({ error: "Plausible service unavailable" });
	}
}
