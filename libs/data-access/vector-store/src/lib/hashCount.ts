import * as crypto from "crypto";

export function getRagVersionHash(content: string): string {
	const serialized = JSON.stringify(content);
	return crypto.createHash("sha256").update(serialized).digest("hex");
}
