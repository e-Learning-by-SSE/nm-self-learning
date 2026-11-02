import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/** Creates a Prisma client connected through the PostgreSQL driver adapter. */
export function createPrismaClient(): PrismaClient {
	const connectionString = process.env["DATABASE_URL"];
	if (!connectionString) {
		throw new Error("DATABASE_URL must be set to create a Prisma client.");
	}

	return new PrismaClient({
		adapter: new PrismaPg({ connectionString })
	});
}
