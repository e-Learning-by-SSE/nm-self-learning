/* eslint-disable @typescript-eslint/ban-ts-comment */
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices
// https://github.com/prisma/prisma/issues/6219

import { PrismaClient } from "@prisma/client";

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient;
		}
	}
}

/** Object that provides access to the database. */
export let database: PrismaClient = null as unknown as PrismaClient;

if (typeof window === "undefined") {
	if (process.env["NODE_ENV"] === "production") {
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
} else if ((process.env["NODE_ENV"] as string) === "test") {
	database = new PrismaClient();
}
