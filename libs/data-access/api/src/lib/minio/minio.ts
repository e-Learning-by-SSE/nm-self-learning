import { Client, ClientOptions } from "minio";
import { z } from "zod";

export const minioConfig: ClientOptions & { bucketName: string; publicUrl?: string } = z
	.object({
		endPoint: z.string(),
		port: z.number(),
		useSSL: z.boolean().optional(),
		accessKey: z.string(),
		secretKey: z.string(),
		bucketName: z.string()
	})
	.parse({
		endPoint: process.env.MINIO_ENDPOINT,
		port: parseInt(process.env.MINIO_PORT as string),
		useSSL: process.env.MINIO_USE_SSL === "true",
		accessKey: process.env.MINIO_ACCESS_KEY,
		secretKey: process.env.MINIO_SECRET_KEY,
		bucketName: process.env.MINIO_BUCKET_NAME
	});

export const minioClient = new Client(minioConfig);

// Separate client for generating presigned URLs using the public hostname.
// The browser uses this URL directly, so it must use the publicly reachable host.
export const publicMinioConfig = (() => {
	const publicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
	if (!publicUrl) return minioConfig;
	const parsed = new URL(publicUrl);
	return {
		...minioConfig,
		endPoint: parsed.hostname,
		port: parseInt(parsed.port) || (parsed.protocol === "https:" ? 443 : 80),
		useSSL: parsed.protocol === "https:"
	};
})();

export const publicMinioClient = new Client(publicMinioConfig);

/**
 * Returns the URLs of all HTML files within the specified folder in the MinIO bucket.
 * @param folderObjectName A subfolder within the MinIO bucket to search for HTML files.
 * @returns An array of URLs pointing to the HTML files found within the specified folder.
 */
export async function getHtmlFiles(folderObjectName: string): Promise<string[]> {
	const prefix = folderObjectName.endsWith("/") ? folderObjectName : `${folderObjectName}/`;

	const htmlFiles: string[] = [];

	const stream = minioClient.listObjectsV2(minioConfig.bucketName, prefix, true);

	return new Promise((resolve, reject) => {
		stream.on("data", object => {
			if (object.name && /\.html?$/i.test(object.name)) {
				htmlFiles.push(object.name);
			}
		});

		stream.on("error", reject);

		stream.on("end", () => {
			resolve(htmlFiles);
		});
	});
}
