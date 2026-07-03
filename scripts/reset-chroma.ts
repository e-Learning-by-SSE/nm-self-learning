// Utility: deletes ALL collections from ChromaDB.
//
// Usage (from repo root, inside the dev container):
//   npx tsx --tsconfig tsconfig.base.json scripts/reset-chroma.ts
import "dotenv/config";
import { ChromaClient, EmbeddingFunction, registerEmbeddingFunction } from "chromadb";

// Register the same embedding function that vector-store.ts uses.
// Without this, listCollections() deserializes each collection and warns for
// every one it cannot find a matching registered constructor for.
class CustomEmbeddingFunction implements EmbeddingFunction {
	public static readonly FUNCTION_NAME = "custom-direct-embeddings";
	public name = CustomEmbeddingFunction.FUNCTION_NAME;
	async generate(): Promise<number[][]> {
		throw new Error("Should never be called");
	}
	getConfig(): Record<string, never> {
		return {};
	}
	static buildFromConfig(): CustomEmbeddingFunction {
		return new CustomEmbeddingFunction();
	}
}
registerEmbeddingFunction(CustomEmbeddingFunction.FUNCTION_NAME, CustomEmbeddingFunction as never);

const HOST = process.env["CHROMA_HOST"] ?? "chroma";
const PORT = Number(process.env["CHROMA_PORT"] ?? 8000);
const SSL = process.env["CHROMA_SSL"] === "true";

const client = new ChromaClient({ host: HOST, port: PORT, ssl: SSL });
console.log(`[ChromaReset] Connecting to ChromaDB at ${HOST}:${PORT} …`);

let deleted = 0;
let failed = 0;

async function main() {
	let collections: { name: string }[];
	try {
		collections = await client.listCollections();
	} catch (err) {
		console.error("[ChromaReset] Could not reach ChromaDB. Is it running?", err);
		process.exit(1);
	}

	if (collections.length === 0) {
		console.log("[ChromaReset] No collections found — nothing to delete.");
		return;
	}

	for (const col of collections) {
		try {
			await client.deleteCollection({ name: col.name });
			console.log(`[ChromaReset] ✓ Deleted: ${col.name}`);
			deleted++;
		} catch (err) {
			console.error(`[ChromaReset] ✗ Failed to delete: ${col.name}`, err);
			failed++;
		}
	}

	// Verify
	const remaining = await client.listCollections();
	if (remaining.length === 0) {
		console.log(`\n[ChromaReset] Done. deleted=${deleted}, failed=${failed}`);
		console.log("[ChromaReset] ✓ ChromaDB is now empty.");
	} else {
		console.warn(`[ChromaReset] ⚠ ${remaining.length} collection(s) still remain.`);
		main();
	}
}

main().catch(err => {
	console.error("[ChromaReset] Unexpected error", err);
	process.exit(1);
});
