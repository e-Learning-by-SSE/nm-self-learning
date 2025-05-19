import { NextApiRequest, NextApiResponse } from "next";

/**
 * Legacy manifest endpoint for PWA support.
 * To migrate to /app see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest#generate-a-manifest-file
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.setHeader("Content-Type", "application/manifest+json");
	res.setHeader("Cache-Control", "public, max-age=3600");
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

	res.status(200).json({
		name: "SelfLearn",
		short_name: "SelfLearn",
		description: "The SelfLearn platform",
		start_url: basePath,
		display: "standalone",
		background_color: "#fff",
		theme_color: "#fff",
		icons: [
			{ src: basePath + "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: basePath + "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
			{
				src: basePath + "/icon-mask.png",
				type: "image/png",
				sizes: "512x512",
				purpose: "maskable"
			}
		]
	});
}
