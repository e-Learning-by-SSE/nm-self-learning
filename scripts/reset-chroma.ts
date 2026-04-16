import "dotenv/config";
import { ChromaClient } from "chromadb";

async function main() {
	const client = new ChromaClient({
		host: process.env["CHROMA_HOST"] || "localhost",
		port: Number(process.env["CHROMA_PORT"]) || 8000,
		ssl: false
	});

	const collections = await client.listCollections();
	console.log(`Found ${collections.length} collections to delete`);

	for (const col of collections) {
		await client.deleteCollection({ name: col.name });
		console.log(`Deleted: ${col.name}`);
	}

	console.log("Done. All collections deleted.");
}

main().catch(console.error);
