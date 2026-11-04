import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

export const s3Config = z
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

function createClient(config: typeof s3Config) {
	return new S3Client({
		endpoint: `${config.useSSL ? "https" : "http"}://${config.endPoint}:${config.port}`,
		region: "us-east-1",
		forcePathStyle: true,
		credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
		requestChecksumCalculation: "WHEN_REQUIRED",
		responseChecksumValidation: "WHEN_REQUIRED"
	});
}

export const s3Client = createClient(s3Config);

// Separate client for generating presigned URLs using the public hostname.
// The browser uses this URL directly, so it must use the publicly reachable host.
export const publicS3Config = (() => {
	const publicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
	if (!publicUrl) return s3Config;
	const parsed = new URL(publicUrl);
	return {
		...s3Config,
		endPoint: parsed.hostname,
		port: parseInt(parsed.port) || (parsed.protocol === "https:" ? 443 : 80),
		useSSL: parsed.protocol === "https:"
	};
})();

export const publicS3Client = createClient(publicS3Config);

/**
 * Returns the object names of all files within the specified folder in the MinIO bucket
 * that match the provided regular expression.
 *
 * @param folderObjectName A subfolder within the MinIO bucket to search.
 * @param regex Regular expression used to filter object names. Lists by default all HTML files.
 * @returns An array containing the object names of all matching files.
 */
export async function getFiles(
	folderObjectName: string,
	regex: RegExp = /\.html?$/i
): Promise<string[]> {
	const prefix = folderObjectName.endsWith("/") ? folderObjectName : `${folderObjectName}/`;
	const names = await listObjectNames(prefix);
	return names.filter(name => regex.test(name));
}

export async function listObjectNames(prefix: string): Promise<string[]> {
	const names: string[] = [];
	let continuationToken: string | undefined;
	do {
		const page = await s3Client.send(
			new ListObjectsV2Command({
				Bucket: s3Config.bucketName,
				Prefix: prefix,
				ContinuationToken: continuationToken
			})
		);
		for (const object of page.Contents ?? []) {
			if (object.Key) names.push(object.Key);
		}
		continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
		if (page.IsTruncated && !continuationToken) {
			throw new Error("Truncated object listing did not include a continuation token.");
		}
	} while (continuationToken);
	return names;
}
