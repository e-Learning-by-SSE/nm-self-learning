import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "libs/data-access/database/prisma/schema",
	migrations: {
		path: "libs/data-access/database/prisma/migrations",
		seed: "tsx --tsconfig ./libs/data-access/database/tsconfig.lib.json libs/data-access/database/src/lib/seed.ts"
	},
	datasource: {
		url: env("DATABASE_URL")
	}
});
