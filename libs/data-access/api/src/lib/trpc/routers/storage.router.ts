import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { uploadedAssetSchema } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
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
	removeFileAsAdmin: adminProcedure
		.input(
			z.object({
				objectName: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const deleted = await removeFile(input.objectName);
			console.log("[storageRouter.removeFileAsAdmin] File removed:", deleted);
			return deleted;
		}),
	registerAsset: authProcedure.input(uploadedAssetSchema).mutation(({ ctx, input }) => {
		return database.uploadedAssets.create({
			data: {
				...input,
				username: ctx.user.name
			}
		});
	}),
	getMyAssets: authProcedure
		.input(paginationSchema.extend({ fileName: z.string().optional() }))
		.query(async ({ ctx, input: { fileName, page } }) => {
			const pageSize = 5;

			const where: Prisma.UploadedAssetsWhereInput = {
				username: ctx.user.name,
				fileName:
					fileName && fileName.length > 0
						? { contains: fileName, mode: "insensitive" }
						: undefined
			};

			const [result, totalCount] = await database.$transaction([
				database.uploadedAssets.findMany({
					where,
					orderBy: { createdAt: "desc" },
					...paginate(pageSize, page)
				}),
				database.uploadedAssets.count({ where })
			]);

			return { result, totalCount, page, pageSize } satisfies Paginated<unknown>;
		}),
	removeMyAsset: authProcedure
		.input(z.object({ objectName: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { objectName } = input;

			const { username } = await database.uploadedAssets.findUniqueOrThrow({
				where: { objectName },
				select: { username: true }
			});

			if (username !== ctx.user.name) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Removing assets of another user requires 'ADMIN' role."
				});
			}

			const deleted = await removeFile(objectName);

			console.log("[storageRouter.removeMyAsset] File removed:", deleted);

			return deleted;
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

async function removeFile(objectName: string) {
	try {
		await _removeFileFromStorageServer(objectName);
	} catch (err) {
		console.error("Error removing file", err);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Error removing file from storage server."
		});
	}

	return database.uploadedAssets.delete({
		where: { objectName },
		select: {
			objectName: true,
			fileName: true,
			publicUrl: true,
			username: true
		}
	});
}

/** Uses the `minio` SDK to remove a file. */
function _removeFileFromStorageServer(filename: string): Promise<void> {
	return new Promise((res, rej) => {
		minioClient.removeObject(minioConfig.bucketName, filename, err => {
			if (err) {
				rej(err);
			}
			res();
		});
	});
}
