// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices
// https://github.com/prisma/prisma/issues/6219

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
	connectionString: process.env["DATABASE_URL"]
});

export const database =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter
	});

if (process.env["NODE_ENV"] !== "production") {
	globalForPrisma.prisma = database;
}
