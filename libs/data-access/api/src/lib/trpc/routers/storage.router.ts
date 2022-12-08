import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { getRandomId } from "@self-learning/util/common";
import { Client, ClientOptions } from "minio";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";

export const minioConfig: ClientOptions & { bucketName: string; publicUrl?: string } = z
	.object({
		publicUrl: z.string().optional(), // If not specified, we fallback to <protocol>://<host>:<port>
		endPoint: z.string(),
		port: z.number(),
		useSSL: z.boolean().optional(),
		accessKey: z.string(),
		secretKey: z.string(),
		bucketName: z.string()
	})
	.parse({
		publicUrl: process.env.MINIO_PUBLIC_URL,
		endPoint: process.env.MINIO_ENDPOINT,
		port: parseInt(process.env.MINIO_PORT as string),
		useSSL: process.env.MINIO_USE_SSL === "true",
		accessKey: process.env.MINIO_ACCESS_KEY,
		secretKey: process.env.MINIO_SECRET_KEY,
		bucketName: process.env.MINIO_BUCKET_NAME
	});

export const minioClient = new Client(minioConfig);

const publicUrlWithBucket = minioConfig.publicUrl
	? `${minioConfig.publicUrl}/${minioConfig.bucketName}`
	: `${minioConfig.useSSL ? "https" : "http"}://${minioConfig.endPoint}:${minioConfig.port}/${
			minioConfig.bucketName
	  }`;

console.log("[Storage]: Files will be uploaded to:", publicUrlWithBucket);

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

			return {
				presignedUrl,
				publicUrl: `${publicUrlWithBucket}/${randomizedFilename}`
			};
		}),
	removeFile: adminProcedure
		.input(
			z.object({
				filename: z.string()
			})
		)
		.mutation(({ input }) => {
			return removeFile(input.filename);
		}),
	registerAsset: authProcedure
		.input(
			z.object({
				filename: z.string(),
				publicUrl: z.string(),
				filetype: z.string()
			})
		)
		.mutation(({ ctx, input }) => {
			const data: Prisma.UploadedAssetsCreateManyInput = {
				username: ctx.user.name,
				filename: input.filename,
				publicUrl: input.publicUrl,
				filetype: input.filetype,
				createdAt: new Date().toISOString()
			};

			return database.uploadedAssets.upsert({
				where: { publicUrl: input.publicUrl },
				update: data,
				create: data
			});
		}),
	getMyAssets: authProcedure.query(({ ctx }) => {
		return database.uploadedAssets.findMany({
			where: { username: ctx.user.name },
			orderBy: { createdAt: "desc" }
		});
	})
});

/** Uses the `minio` SDK to request a presigned URL that users can upload files to. */
function getPresignedUrl(filename: string): Promise<string> {
	return new Promise((res, rej) => {
		minioClient.presignedPutObject(minioConfig.bucketName, filename, (err, result) => {
			if (err) {
				console.error("Error getting presigned URL", err);
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
