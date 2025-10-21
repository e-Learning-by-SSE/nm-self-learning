import "dotenv/config";
import type { PrismaConfig } from "prisma";

export default {
	schema: "libs/data-access/database/prisma/schema",
	migrations: {
		path: "libs/data-access/database/prisma/migrations",
		seed: "tsx --tsconfig ./libs/data-access/database/tsconfig.lib.json libs/data-access/database/src/lib/seed.ts"
	}
} satisfies PrismaConfig;
