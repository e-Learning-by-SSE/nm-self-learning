import "dotenv/config";
import type { PrismaConfig } from "prisma";

export default {
	schema: "libs/data-access/database/prisma/schema",
	migrations: {
		path: "libs/data-access/database/prisma/migrations"
	}
} satisfies PrismaConfig;
