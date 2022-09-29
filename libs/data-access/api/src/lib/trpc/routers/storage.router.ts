import { getRandomId } from "@self-learning/util/common";
import { Client } from "minio";
import { z } from "zod";
import { authProcedure, t } from "../trpc";

export const minioConfig = z
	.object({
		endPoint: z.string(),
		port: z.number(),
		accessKey: z.string(),
		secretKey: z.string(),
		publicUrl: z.string(),
		bucketName: z.string()
	})
	.parse({
		endPoint: process.env.MINIO_ENDPOINT,
		port: parseInt(process.env.MINIO_PORT as string),
		accessKey: process.env.MINIO_ACCESS_KEY,
		secretKey: process.env.MINIO_SECRET_KEY,
		publicUrl: process.env.MINIO_PUBLIC_URL,
		bucketName: process.env.MINIO_BUCKET_NAME
	});

export const minioClient = new Client({ ...minioConfig, useSSL: false });

export const storageRouter = t.router({
	getPresignedUrl: authProcedure
		.input(
			z.object({
				filename: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const randomizedFilename = `${getRandomId()}-${input.filename}`;
			const presignedUrl = await getPresignedUrl(randomizedFilename);
			const publicUrl = `${minioConfig.publicUrl}/${minioConfig.bucketName}/${randomizedFilename}`;

			return {
				presignedUrl,
				publicUrl
			};
		}),
	removeFile: authProcedure
		.input(
			z.object({
				filename: z.string()
			})
		)
		.mutation(({ input }) => {
			return removeFile(input.filename);
		})
});

/** Uses the `minio` SDK to request a presigned URL that users can upload files to. */
function getPresignedUrl(filename: string): Promise<string> {
	return new Promise((res, rej) => {
		minioClient.presignedPutObject(minioConfig.bucketName, filename, (err, result) => {
			if (err) {
				rej(err);
			}
			res(result);
		});
	});
}

/** Uses the `minio` SDK to remove a file. */
function removeFile(filename: string): Promise<void> {
	return new Promise((res, rej) => {
		minioClient.removeObject(minioConfig.bucketName, filename, err => {
			if (err) {
				rej(err);
			}
			res();
		});
	});
}
