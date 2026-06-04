import * as crypto from "crypto";

/**
 * Generate a SHA-256 hash for RAG version tracking
 *
 * Used to detect when lesson content has changed and needs re-embedding.
 *
 * @param content - Content to hash (typically stringified JSON)
 * @returns SHA-256 hash as hex string
 */
export function getRagVersionHash(content: string): string {
	return crypto.createHash("sha256").update(content).digest("hex");
}
