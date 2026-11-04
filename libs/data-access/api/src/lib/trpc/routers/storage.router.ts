import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "node:stream";
import { Prisma } from "@self-learning/database/server";
import { database } from "@self-learning/database/server";
import { uploadedAssetSchema } from "@self-learning/types";
import { getRandomId, paginate, Paginated, paginationSchema } from "@self-learning/util/common";
import { TRPCError } from "@trpc/server";
import * as unzipper from "unzipper";
import { z } from "zod";
import { adminProcedure, authProcedure, t } from "../trpc";
import { hoursToSeconds } from "date-fns";
import { listObjectNames, s3Client, s3Config, publicS3Client } from "../../s3/s3client";

/**
 * Time in seconds after which the presigned URL expires.
 */
const uploadTimeOut = hoursToSeconds(4);

/** Max allowed uncompressed size per archive (200 MB) */
const MAX_UNCOMPRESSED_BYTES = 200 * 1024 * 1024;

/** Max allowed number of entries in an archive */
const MAX_ENTRIES = 1500;

function sanitizeObjectName(filename: string): string {
	return filename
		.normalize("NFKD") // Normalizes unicode to NFKD (Normalization Form Compatibility Decomposition) form
		.replace(/[\u0300-\u036f]/g, "") // Remove umlauts
		.replace(/[^a-zA-Z0-9._-]/g, "_") // Replace non-alphanumeric characters with underscores
		.replace(/_+/g, "_"); // Merge multiple consecutive underscores into one
}

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
			const randomizedFilename = `${getRandomId()}-${sanitizeObjectName(input.filename)}`;
			try {
				const presignedUrl = await getPresignedUrl(randomizedFilename);

				// Presigned URL contains a temporary signature that allows the user to upload a file to the storage server.
				// The URL is only valid for a short period of time.
				// We need further the download URL
				// Delete after character "?" because these are the parameters for the upload
				// TODO: Requires public download option -> Implement download via presignedUrl
				const downloadUrl = presignedUrl.slice(0, presignedUrl.indexOf("?"));

				// Return the actual generated object name so callers can register
				// the correct MinIO key (avoids mismatch with client-generated UUIDs)
				return { presignedUrl, downloadUrl, objectName: randomizedFilename };
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
				// Download archive from object storage as a stream
				const { Body: archiveStream } = await s3Client.send(
					new GetObjectCommand({
						Bucket: s3Config.bucketName,
						Key: objectName
					})
				);
				if (!(archiveStream instanceof Readable))
					throw new Error("Archive stream is unavailable.");

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
							const entryPath = entry.path.replace(/\\/g, "/");
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
							// Size limit is enforced on actual extracted bytes, not zip metadata
							// which can be missing or falsified in crafted archives
							const uploadPromise = (async () => {
								const entryBuffer = await entry.buffer();

								// Enforce size limit based on actual extracted bytes
								totalBytes += entryBuffer.length;
								if (totalBytes > MAX_UNCOMPRESSED_BYTES) {
									throw new TRPCError({
										code: "BAD_REQUEST",
										message: `Archive exceeds maximum uncompressed size of ${MAX_UNCOMPRESSED_BYTES / 1024 / 1024} MB.`
									});
								}

								const targetObjectName = `${folderPrefix}/${entryPath}`;
								await s3Client.send(
									new PutObjectCommand({
										Bucket: s3Config.bucketName,
										Key: targetObjectName,
										Body: entryBuffer,
										ContentType: getMimeType(entryPath)
									})
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
				const folderUrl = `${publicUrl}/${s3Config.bucketName}/${folderPrefix}`;

				// Delete the original archive now that it's been unpacked
				await s3Client.send(
					new DeleteObjectCommand({ Bucket: s3Config.bucketName, Key: objectName })
				);

				// For zip: store full viewer URL including entry point
				// For h5p: store folder URL (h5p-standalone handles the rest)
				const viewerUrl = kind === "zip" ? `${folderUrl}/${entryPoint}` : folderUrl;

				const originalPublicUrl = `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${s3Config.bucketName}/${objectName}`;
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

/** Generates a presigned URL that users can upload files to. */
async function getPresignedUrl(filename: string): Promise<string> {
	return getSignedUrl(
		publicS3Client,
		new PutObjectCommand({
			Bucket: s3Config.bucketName,
			Key: filename
		}),
		{ expiresIn: uploadTimeOut }
	);
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

async function _removeFileFromStorageServer(filename: string): Promise<void> {
	if (filename.startsWith("content/")) {
		const names = await listObjectNames(`${filename}/`);
		// S3 accepts at most 1000 keys per delete request.
		for (let i = 0; i < names.length; i += 1000) {
			const result = await s3Client.send(
				new DeleteObjectsCommand({
					Bucket: s3Config.bucketName,
					Delete: { Objects: names.slice(i, i + 1000).map(Key => ({ Key })) }
				})
			);
			if (result.Errors?.length) {
				throw new Error(
					`Failed to delete objects: ${result.Errors.map(error => error.Key).join(", ")}`
				);
			}
		}
		return;
	}

	await s3Client.send(
		new DeleteObjectCommand({ Bucket: s3Config.bucketName, Key: filename })
	);
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
