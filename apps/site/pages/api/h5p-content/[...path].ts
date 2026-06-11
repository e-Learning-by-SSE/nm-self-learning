import { NextApiRequest, NextApiResponse } from "next";
import { minioClient, minioConfig } from "../../../../../libs/data-access/api/src/lib/trpc/routers/storage.router";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const pathSegments = Array.isArray(req.query.path) ? (req.query.path as string[]) : [];

	// Security: reject path traversal and empty paths
	if (
		pathSegments.length === 0 ||
		pathSegments.some(s => s.includes("..") || s.includes("\\") || s.startsWith("/"))
	) {
		return res.status(400).json({ error: "Invalid path" });
	}

	const objectName = pathSegments.join("/");

	// Security: only serve content from the content/ prefix
	if (!objectName.startsWith("content/")) {
		return res.status(403).json({ error: "Forbidden" });
	}

	try {
		const stream = await minioClient.getObject(minioConfig.bucketName, objectName);

		// Set content type based on extension
		const ext = objectName.split(".").pop()?.toLowerCase() ?? "";
		const contentTypes: Record<string, string> = {
			json: "application/json",
			js: "application/javascript",
			css: "text/css",
			html: "text/html",
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			mp4: "video/mp4",
			mp3: "audio/mpeg",
			woff: "font/woff",
			woff2: "font/woff2"
		};

		res.setHeader("Content-Type", contentTypes[ext] ?? "application/octet-stream");
		res.setHeader("Cache-Control", "public, max-age=3600");

		stream.pipe(res);
	} catch (_error) {
		res.status(404).json({ error: "Not found", path: objectName });
	}
}