import { Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import { uploadedAssetSchema } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import { Client, ClientOptions } from "minio";
import * as unzipper from "unzipper";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { hoursToSeconds } from "date-fns";

/**
 * Time in seconds after which the presigned URL expires.
 */
const uploadTimeOut = hoursToSeconds(4);

/** Max allowed uncompressed size per archive (200 MB) */
const MAX_UNCOMPRESSED_BYTES = 200 * 1024 * 1024;

/** Max allowed number of entries in an archive */
const MAX_ENTRIES = 1500;

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
const publicMinioConfig = (() => {
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

const publicMinioClient = new Client(publicMinioConfig);

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
			const randomizedFilename = `${getRandomId()}-${input.filename}`;
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
		}),

	/**
	 * Downloads an uploaded zip/h5p archive from MinIO, unpacks it,
	 * and re-uploads each file under a new folder.
	 * Returns the folder URL and entry point for the iframe viewer.
	 */
	unpackArchive: authProcedure
		.input(
			z.object({
				/** The MinIO object name of the already-uploaded archive */
				objectName: z.string(),
				/** The kind of archive: zip (HTML multi-file) or h5p */
				kind: z.enum(["zip", "h5p"])
			})
		)
		.mutation(async ({ input }) => {
			const { objectName, kind } = input;

			try {
				// Download archive from MinIO as a stream
				const archiveStream = await minioClient.getObject(
					minioConfig.bucketName,
					objectName
				);

				// Generate a unique folder prefix for this content
				const folderPrefix = `content/${getRandomId()}`;

				// Track what we unpack
				let entryCount = 0;
				let totalBytes = 0;
				let entryPoint: string | null = null;

				// Parse the zip stream and upload each entry to MinIO
				await new Promise<void>((resolve, reject) => {
					const uploadPromises: Promise<void>[] = [];

					archiveStream
						.pipe(unzipper.Parse())
						.on("entry", (entry: unzipper.Entry) => {
							const entryPath = entry.path;
							const entryType = entry.type;

							// Security: reject path traversal attempts
							if (entryPath.includes("..") || entryPath.startsWith("/")) {
								entry.autodrain();
								return reject(
									new TRPCError({
										code: "BAD_REQUEST",
										message: `Rejected unsafe path in archive: ${entryPath}`
									})
								);
							}

							// Skip directory entries — MinIO doesn't need them
							if (entryType === "Directory") {
								entry.autodrain();
								return;
							}

							// Count entries and check limits
							entryCount++;
							if (entryCount > MAX_ENTRIES) {
								entry.autodrain();
								return reject(
									new TRPCError({
										code: "BAD_REQUEST",
										message: `Archive exceeds maximum of ${MAX_ENTRIES} entries.`
									})
								);
							}

							// Track uncompressed size
							const uncompressedSize =
								(entry.vars as unknown as { uncompressedSize?: number })
									.uncompressedSize ?? 0;
							totalBytes += uncompressedSize;
							if (totalBytes > MAX_UNCOMPRESSED_BYTES) {
								entry.autodrain();
								return reject(
									new TRPCError({
										code: "BAD_REQUEST",
										message: `Archive exceeds maximum uncompressed size of ${MAX_UNCOMPRESSED_BYTES / 1024 / 1024} MB.`
									})
								);
							}

							// Detect the entry point
							const fileName = entryPath.split("/").pop()?.toLowerCase() ?? "";
							if (kind === "zip" && !entryPoint) {
								if (fileName === "index.html" || fileName === "index.htm") {
									entryPoint = entryPath;
								}
							} else if (kind === "h5p" && !entryPoint) {
								if (fileName === "h5p.json") {
									entryPoint = "";
								}
							}

							// Collect upload promise — do NOT await here
							// The entry handler is synchronous; uploads run concurrently
							const uploadPromise = (async () => {
								const entryBuffer = await entry.buffer();
								const targetObjectName = `${folderPrefix}/${entryPath}`;
								await minioClient.putObject(
									minioConfig.bucketName,
									targetObjectName,
									entryBuffer,
									entryBuffer.length,
									{ "Content-Type": getMimeType(entryPath) }
								);
							})();

							uploadPromises.push(uploadPromise);
						})
						.on("finish", () => {
							// Wait for ALL uploads to complete before resolving
							Promise.all(uploadPromises)
								.then(() => resolve())
								.catch(err =>
									reject(
										new TRPCError({
											code: "INTERNAL_SERVER_ERROR",
											message: `Failed to upload entry: ${(err as Error).message}`
										})
									)
								);
						})
						.on("error", (err: Error) => {
							reject(
								new TRPCError({
									code: "INTERNAL_SERVER_ERROR",
									message: `Failed to parse archive: ${err.message}`
								})
							);
						});
				});

				// Validate that we found a valid entry point
				if (kind === "zip" && entryPoint === null) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"No index.html or index.htm found in the zip archive. Please ensure your zip has an index.html at the root or in a subfolder."
					});
				}
				if (kind === "h5p" && entryPoint === null) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message:
							"No h5p.json found in the archive. Please ensure you are uploading a valid .h5p file."
					});
				}

				// Build the public folder URL
				const publicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
				if (!publicUrl) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "NEXT_PUBLIC_MINIO_PUBLIC_URL is not configured."
					});
				}
				const folderUrl = `${publicUrl}/${minioConfig.bucketName}/${folderPrefix}`;

				// Delete the original archive now that it's been unpacked
				await minioClient.removeObject(minioConfig.bucketName, objectName);

				// For zip: store full viewer URL including entry point
				// For h5p: store folder URL (h5p-standalone handles the rest)
				const viewerUrl = kind === "zip" ? `${folderUrl}/${entryPoint}` : folderUrl;

				const originalPublicUrl = `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${minioConfig.bucketName}/${objectName}`;
				await database.uploadedAssets.updateMany({
					where: { publicUrl: originalPublicUrl },
					data: {
						objectName: folderPrefix,
						publicUrl: viewerUrl,
						fileType: kind
					}
				});

				return {
					folderUrl,
					folderObjectName: folderPrefix,
					entryPoint: entryPoint ?? "",
					kind
				};
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to unpack archive: ${(error as Error).message}`
				});
			}
		})
});

/** Uses the `minio` SDK to request a presigned URL that users can upload files to. */
async function getPresignedUrl(filename: string): Promise<string> {
	try {
		return await publicMinioClient.presignedPutObject(
			minioConfig.bucketName,
			filename,
			uploadTimeOut
		);
	} catch (error) {
		const errMsg = (error as Error).message;
		if (errMsg.startsWith("Unable to get bucket region for  ")) {
			await checkMinioServer();
		}
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
	} catch (_error) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Minio Server not reachable at ${minioConfig.endPoint}:${minioConfig.port}`
		});
	}
}

/** Returns a basic MIME type based on file extension for MinIO metadata */
function getMimeType(filename: string): string {
	const ext = filename.split(".").pop()?.toLowerCase() ?? "";
	const mimeTypes: Record<string, string> = {
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		js: "application/javascript",
		json: "application/json",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		svg: "image/svg+xml",
		mp4: "video/mp4",
		mp3: "audio/mpeg",
		woff: "font/woff",
		woff2: "font/woff2",
		ttf: "font/ttf",
		pdf: "application/pdf"
	};
	return mimeTypes[ext] ?? "application/octet-stream";
}

// Exported only for testing purposes
export { getMimeType as getMimeTypeForTest };