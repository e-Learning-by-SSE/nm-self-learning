/* eslint-disable @typescript-eslint/ban-ts-comment */
// /lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

/** Object that provides access to the database. */
export let database: PrismaClient;

if (process.env.NODE_ENV === "production") {
	database = new PrismaClient();
} else {
	// @ts-ignore
	if (!global.prisma) {
		// @ts-ignore
		global.prisma = new PrismaClient();
	}
	// @ts-ignore
	database = global.prisma;
}
