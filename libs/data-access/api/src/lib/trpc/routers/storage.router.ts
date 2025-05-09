import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { uploadedAssetSchema } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { Client, ClientOptions } from "minio";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { file } from "jszip";

/**
 * Time in seconds after which the presigned URL expires.
 */
const uploadTimeOut = 60 * 60 * 4; // 7 hours

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

export const storageRouter = t.router({
	getPresignedUrl: authProcedure
		.input(
			z.object({
				filename: z.string()
			})
		)
		/**
		 * Generates a presigned URL that allows the user to upload a file to the storage server.
		 * @throws {TRPCError} if an error occurs while generating the presigned URL.
		 */
		.mutation(async ({ input }) => {

			const sanitizedFilename = (filename: string) => {
				return filename
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.replace(/[^a-zA-Z0-9.]/g, "_")
			};
		
			const randomizedFilename = `${getRandomId()}-${sanitizedFilename(input.filename)}`;
			try {
				const presignedUrl = await getPresignedUrl(randomizedFilename);

				// Presigned URL contains a temporary signature that allows the user to upload a file to the storage server.
				// The URL is only valid for a short period of time.
				// We need further the download URL
				// Delete after character "?" because these are the parameters for the upload
				// TODO: Requires public download option -> Implement download via presignedUrl
				const downloadUrl = presignedUrl.slice(0, presignedUrl.indexOf("?"));

				return { presignedUrl, downloadUrl };
			} catch (error) {
				const errMsg: string =
					error instanceof Error
						? "Minio Access Error: " + (error.message as string)
						: "Error getting presigned URL";
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: errMsg,
					cause: (error as Error).cause
				});
			}
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
async function getPresignedUrl(filename: string): Promise<string> {
	try {
		return await minioClient.presignedPutObject(
			minioConfig.bucketName,
			filename,
			uploadTimeOut
		);
	} catch (error) {
		const errMsg = (error as Error).message;
		if (errMsg.startsWith("Unable to get bucket region for  ")) {
			// Attempt to get a proper error message, default message is very misleading
			await checkMinioServer();
		}
		// Default error message
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Minio Access Error: ${errMsg}`,
			cause: (error as Error).cause
		});
	}
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
	return minioClient.removeObject(minioConfig.bucketName, filename);
}

/**
 * Checks if the Minio server is reachable and returns an error if not.
 */
async function checkMinioServer() {
	try {
		// Calls a function that requires few configuration (e.g., no access key, bucket, ...)
		await minioClient.listBuckets();
	} catch (error) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Minio Server not reachable at ${minioConfig.endPoint}:${minioConfig.port}`
		});
	}
}
